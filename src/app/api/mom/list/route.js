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
          message: "Email is required",
        },
        {
          status: 400,
        }
      );
    }

    const data = await MomAction.find({
      uploadedByEmail: email,
    }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("MOM LIST ERROR:", error);

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