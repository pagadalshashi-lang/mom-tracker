import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const email = searchParams.get("email");

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

    const actions = await MomAction.find({
      $or: [
        { fprEmail: email },
        { sprEmail: email },
        { fprPersonalEmail: email },
        { sprPersonalEmail: email },
      ],
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: actions,
    });
  } catch (error) {
    console.error(
      "MY ACTION ERROR:",
      error
    );

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