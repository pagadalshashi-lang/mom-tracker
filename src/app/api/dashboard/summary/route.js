import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import User from "@/models/User";

// ==========================
// DATE HELPERS
// ==========================

// Handles both "YYYY-MM-DD" (from <input type="date"> / numeric Excel
// serials) and "DD/MM/YYYY" or "DD-MM-YYYY" (from text-formatted Excel
// cells that pass through unchanged). Returns a Date at midnight, or null.
function parseDateFlexible(value) {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  const dmy = value.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    const d = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
    );
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function isOverdue(row) {
  if (!row.planEndDate) return false;
  if (row.status === "Closed") return false;

  const due = parseDateFlexible(row.planEndDate);
  if (!due) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  return due < today;
}

// ==========================
// AGGREGATION HELPERS
// ==========================

const getStatusCount = (data, status) =>
  data.filter((x) => x.status === status).length;

function accountWiseSummary(data) {
  const map = {};

  data.forEach((row) => {
    const acc = row.account || "(No Account)";

    if (!map[acc]) {
      map[acc] = {
        account: acc,
        open: 0,
        inProcess: 0,
        pending: 0,
        closed: 0,
        dueBy: 0,
        total: 0,
      };
    }

    map[acc].total += 1;

    if (row.status === "Open") map[acc].open += 1;
    else if (row.status === "In Process") map[acc].inProcess += 1;
    else if (row.status === "Pending") map[acc].pending += 1;
    else if (row.status === "Closed") map[acc].closed += 1;

    if (isOverdue(row)) map[acc].dueBy += 1;
  });

  return Object.values(map).sort((a, b) =>
    a.account.localeCompare(b.account)
  );
}

// Applies the Uploaded By / Account / FPR / SPR / Status filters in-memory
// on top of the already my-vs-team-scoped dataset.
function matchesExtraFilters(row, { account, fpr, spr, status, uploadedBy }) {
  if (account && row.account !== account) return false;
  if (fpr && row.fpr !== fpr) return false;
  if (spr && row.spr !== spr) return false;
  if (status && status !== "All" && row.status !== status) return false;
  if (uploadedBy && row.uploadedBy !== uploadedBy) return false;
  return true;
}

function buildFilterOptions(allData) {
  const uniqueSorted = (values) =>
    [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

  return {
    accounts: uniqueSorted(allData.map((r) => r.account)),
    uploadedByList: uniqueSorted(allData.map((r) => r.uploadedBy)),
    fprList: uniqueSorted(allData.map((r) => r.fpr)),
    sprList: uniqueSorted(allData.map((r) => r.spr)),
  };
}

// ==========================
// ROUTE
// ==========================

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const view = searchParams.get("view") || "my";

    // New optional filters
    const accountFilter = searchParams.get("account") || "";
    const fprFilter = searchParams.get("fpr") || "";
    const sprFilter = searchParams.get("spr") || "";
    const statusFilter = searchParams.get("status") || "";
    const uploadedByFilter = searchParams.get("uploadedBy") || "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email required",
        },
        {
          status: 400,
        }
      );
    }

    let baseAssignedMom = [];
    let baseSelfMom = [];

    if (view === "my") {
      // Assigned = MOM I uploaded
      baseAssignedMom = await MomAction.find({
        uploadedByEmail: email,
      });

      // Self = MOM where I'm the FPR or SPR
      baseSelfMom = await MomAction.find({
        $or: [
          { fprEmail: email },
          { sprEmail: email },
          { fprPersonalEmail: email },
          { sprPersonalEmail: email },
        ],
      });
    } else {
      // Logged-in user
      const loggedUser = await User.findOne({ email });

      if (!loggedUser) {
        return NextResponse.json({
          success: false,
          message: "User not found",
        });
      }

      // Same Team Users
      // BA & Head-BA are treated as one team
      let supportRoles = [];

      if (
        loggedUser.supportRole === "BA" ||
        loggedUser.supportRole === "Head-BA"
      ) {
        supportRoles = ["BA", "Head-BA"];
      } else {
        supportRoles = [loggedUser.supportRole];
      }

      const teamUsers = await User.find({
        supportRole: { $in: supportRoles },
      });

      const teamEmails = [];

      teamUsers.forEach((u) => {
        if (u.email) {
          teamEmails.push(u.email);
        }
      });

      // Assigned = MOM uploaded by my team
      baseAssignedMom = await MomAction.find({
        uploadedByEmail: { $in: teamEmails },
      });

      // Self = MOM where a team member is FPR or SPR
      baseSelfMom = await MomAction.find({
        $or: [
          { fprEmail: { $in: teamEmails } },
          { sprEmail: { $in: teamEmails } },
          { fprPersonalEmail: { $in: teamEmails } },
          { sprPersonalEmail: { $in: teamEmails } },
        ],
      });
    }

    // Filter dropdown options come from the FULL my/team-scoped dataset,
    // before the account/fpr/spr/status/uploadedBy filters are applied —
    // so the dropdowns don't shrink as the user filters.
    const allDataForOptions = [...baseAssignedMom, ...baseSelfMom];
    const filterOptions = buildFilterOptions(allDataForOptions);

    const extra = {
      account: accountFilter,
      fpr: fprFilter,
      spr: sprFilter,
      status: statusFilter,
      uploadedBy: uploadedByFilter,
    };

    const assignedMom = baseAssignedMom.filter((row) =>
      matchesExtraFilters(row, extra)
    );

    const selfMom = baseSelfMom.filter((row) =>
      matchesExtraFilters(row, extra)
    );

    return NextResponse.json({
      success: true,

      assignedCount: assignedMom.length,
      selfCount: selfMom.length,

      assignedStatus: {
        open: getStatusCount(assignedMom, "Open"),
        inProcess: getStatusCount(assignedMom, "In Process"),
        pending: getStatusCount(assignedMom, "Pending"),
        closed: getStatusCount(assignedMom, "Closed"),
      },

      selfStatus: {
        open: getStatusCount(selfMom, "Open"),
        inProcess: getStatusCount(selfMom, "In Process"),
        pending: getStatusCount(selfMom, "Pending"),
        closed: getStatusCount(selfMom, "Closed"),
      },

      assignedDueCount: assignedMom.filter(isOverdue).length,
      selfDueCount: selfMom.filter(isOverdue).length,

      assignedAccountWise: accountWiseSummary(assignedMom),
      selfAccountWise: accountWiseSummary(selfMom),

      filterOptions,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    );
  }
}