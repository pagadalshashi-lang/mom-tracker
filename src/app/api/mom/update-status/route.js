import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import MomHistory from "@/models/MomHistory";

export async function POST(req) {
  try {
    await connectDB();

    const {
      id,

      account,

      status,
      remark,

      planStartDate,
      actualStartDate,

      planEndDate,
      actualEndDate,

      updatedBy,
      updatedByEmail,
    } = await req.json();

    const oldData = await MomAction.findById(id);

    if (!oldData) {
      return NextResponse.json(
        {
          success: false,
          message: "Task not found",
        },
        {
          status: 404,
        }
      );
    }

    // Closed task cannot be edited

    if (oldData.status === "Closed") {
      return NextResponse.json(
        {
          success: false,
          message: "Closed task cannot be edited",
        },
        {
          status: 400,
        }
      );
    }

    // Auto set Actual End Date if Closed

    let finalActualEndDate = actualEndDate;
    let finalActualStartDate = oldData.actualStartDate;

    if (actualStartDate && !oldData.actualStartDate) {
      finalActualStartDate = actualStartDate;
    }

    if (status === "Closed" && !actualEndDate) {
      finalActualEndDate = new Date();
    }

    // Fall back to existing values if the account / plan start date
    // weren't sent (keeps this endpoint backward compatible)
    const finalAccount = account || oldData.account;
    const finalPlanStartDate = planStartDate || oldData.planStartDate;

    // Update MOM Action

    const updatedAction = await MomAction.findByIdAndUpdate(
      id,
      {
        account: finalAccount,

        status,
        remark,

        planStartDate: finalPlanStartDate,
        actualStartDate: finalActualStartDate,

        planEndDate,

        actualEndDate: finalActualEndDate,

        updatedBy,
        updatedByEmail,

        updatedAt: new Date(),
      },
      {
        new: true,
      }
    );

    // Save History

    await MomHistory.create({
      momId: id,

      updatedBy,
      updatedByEmail,

      oldAccount: oldData.account,
      newAccount: finalAccount,

      oldStatus: oldData.status,

      newStatus: status,

      oldRemark: oldData.remark,

      newRemark: remark,

      oldPlanStartDate: oldData.planStartDate,

      newPlanStartDate: finalPlanStartDate,

      oldPlanEndDate: oldData.planEndDate,

      newPlanEndDate: planEndDate,

      oldActualEndDate: oldData.actualEndDate,

      newActualEndDate: finalActualEndDate,
    });

    return NextResponse.json({
      success: true,
      message: "Task Updated Successfully",

      data: updatedAction,
    });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);

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