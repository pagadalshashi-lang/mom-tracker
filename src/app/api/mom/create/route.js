import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const mom = await MomAction.create(body);

    return NextResponse.json({
      success: true,
      data: mom,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}