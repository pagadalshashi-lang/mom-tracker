import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");
    const view = searchParams.get("view") || "my";

    const status = searchParams.get("status") || "All";
    const uploadedBy = searchParams.get("uploadedBy") || "All";
    const account = searchParams.get("account") || "";
    const fpr = searchParams.get("fpr") || "";
    const spr = searchParams.get("spr") || "";
    const planStartDate = searchParams.get("planStartDate");
    const planEndDate = searchParams.get("planEndDate");

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

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

    let baseFilter = {};

    // ===========================
    // MY TASKS
    // ===========================

    if (view === "my") {
      baseFilter = {
        $or: [
          { fprEmail: email },
          { sprEmail: email },
          { fprPersonalEmail: email },
          { sprPersonalEmail: email },
        ],
      };
    }

    // ===========================
    // UPLOADED BY ME
    // ===========================

    else if (view === "uploaded") {
      baseFilter = {
        uploadedByEmail: email,
      };
    }

    // ===========================
    // MY TEAM
    // ===========================

    else {
      const loggedUser = await User.findOne({ email });

      if (!loggedUser) {
        return NextResponse.json({
          success: false,
          message: "User not found",
        });
      }

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

      const teamEmails = teamUsers.map((u) => u.email);

      baseFilter = {
        $or: [
          { fprEmail: { $in: teamEmails } },
          { sprEmail: { $in: teamEmails } },
          { fprPersonalEmail: { $in: teamEmails } },
          { sprPersonalEmail: { $in: teamEmails } },
          { uploadedByEmail: { $in: teamEmails } },
        ],
      };
    }

    // ===========================
    // FILTER OPTIONS
    // (scoped to the current view only, so dropdowns don't shrink
    // as the user applies status/account/fpr/spr filters)
    // ===========================

    const [uploadedByList, accounts, fprList, sprList] = await Promise.all([
      MomAction.distinct("uploadedBy", baseFilter),
      MomAction.distinct("account", baseFilter),
      MomAction.distinct("fpr", baseFilter),
      MomAction.distinct("spr", baseFilter),
    ]);

    const sortClean = (arr) =>
      arr.filter(Boolean).sort((a, b) => a.localeCompare(b));

    const filterOptions = {
      uploadedByList: sortClean(uploadedByList),
      accounts: sortClean(accounts),
      fprList: sortClean(fprList),
      sprList: sortClean(sprList),
    };

    // ===========================
    // APPLY FILTERS
    // ===========================

    const filter = { ...baseFilter };

    if (status !== "All") {
      filter.status = status;
    }

    if (uploadedBy !== "All") {
      filter.uploadedBy = uploadedBy;
    }

    if (account) {
      filter.account = account;
    }

    if (fpr) {
      filter.fpr = fpr;
    }

    if (spr) {
      filter.spr = spr;
    }

    if (planStartDate) {
      filter.planStartDate = planStartDate;
    }

    if (planEndDate) {
      filter.planEndDate = planEndDate;
    }

    const total = await MomAction.countDocuments(filter);

    const actions = await MomAction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: actions,
      filterOptions,
      // kept for backward compatibility with any existing callers
      uploadedByList: filterOptions.uploadedByList,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("MY ACTION ERROR:", error);

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