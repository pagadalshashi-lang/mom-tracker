import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

export async function PUT(req) {
  try {
    await connectDB();

    const {
      id,
      status,
      remark,
      fpr,
      spr,
    } = await req.json();

    const updated =
      await MomAction.findByIdAndUpdate(
        id,
        {
          status,
          remark,
          fpr,
          spr,
        },
        {
          new: true,
        }
      );

    return NextResponse.json({
      success: true,
      data: updated,
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