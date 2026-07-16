import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || "All";
    const uploadedBy = searchParams.get("uploadedBy") || "All";
    const account = searchParams.get("account") || "";
    const fpr = searchParams.get("fpr") || "";
    const spr = searchParams.get("spr") || "";

    const baseFilter = {
      status: {
        $in: ["Open", "Pending", "In Process"],
      },
    };

    // ===========================
    // FILTER OPTIONS
    // (scoped to the base "not yet closed" set, so dropdowns don't
    // shrink as the user applies account/fpr/spr/uploadedBy/status)
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

    if (status !== "All") filter.status = status;
    if (uploadedBy !== "All") filter.uploadedBy = uploadedBy;
    if (account) filter.account = account;
    if (fpr) filter.fpr = fpr;
    if (spr) filter.spr = spr;

    const data = await MomAction.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data,
      filterOptions,
    });
  } catch (error) {
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