import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import MomHistory from "@/models/MomHistory";

export async function POST(req) {
  try {
    await connectDB();

   const {
  id,

  status,
  remark,

  actualStartDate,

  planEndDate,
  actualEndDate,

  updatedBy,
  updatedByEmail,
} = await req.json();
    const oldData =
      await MomAction.findById(id);

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

    if (
      oldData.status === "Closed"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Closed task cannot be edited",
        },
        {
          status: 400,
        }
      );
    }

    // Auto set Actual End Date if Closed

    let finalActualEndDate =
      actualEndDate;
let finalActualStartDate =
  oldData.actualStartDate;

if (
  actualStartDate &&
  !oldData.actualStartDate
) {
  finalActualStartDate =
    actualStartDate;
}
      
    if (
      status === "Closed" &&
      !actualEndDate
    ) {
      finalActualEndDate =
        new Date();
    }

    // Update MOM Action

    const updatedAction =
      await MomAction.findByIdAndUpdate(
        id,
      {
  status,
  remark,

  actualStartDate:
    finalActualStartDate,

  planEndDate,

  actualEndDate:
    finalActualEndDate,

  updatedBy,
  updatedByEmail,

  updatedAt:
    new Date(),
}
  ,
        {
          new: true,
        }
      );

    // Save History

    await MomHistory.create({
      momId: id,

      updatedBy,
      updatedByEmail,

      oldStatus:
        oldData.status,

      newStatus:
        status,

      oldRemark:
        oldData.remark,

      newRemark:
        remark,

      oldPlanEndDate:
        oldData.planEndDate,

      newPlanEndDate:
        planEndDate,

      oldActualEndDate:
        oldData.actualEndDate,

      newActualEndDate:
        finalActualEndDate,
    });

    return NextResponse.json({
      success: true,
      message:
        "Task Updated Successfully",

      data: updatedAction,
    });
  } catch (error) {
    console.error(
      "UPDATE STATUS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}