import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

export async function GET() {
  try {
    await connectDB();

    const data =
      await MomAction.find({
        status: {
          $in: [
            "Open",
            "Pending",
            "In Process",
          ],
        },
      }).sort({
        createdAt: -1,
      });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
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