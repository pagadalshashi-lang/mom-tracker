import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {

  if (mongoose.connections[0].readyState) {
    return;
  }

  await mongoose.connect(MONGODB_URI);

}

export async function POST(req) {

  try {

    await connectDB();

    const body = await req.json();

    const { email, password } = body;

    const user = await User.findOne({
      email,
      password,
    });

    if (!user) {

      return NextResponse.json(
        { message: "Invalid Email or Password" },
        { status: 401 }
      );

    }

    return NextResponse.json(
      {
        message: "Login Successful",
        user,
      },
      { status: 200 }
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { message: "Login Failed" },
      { status: 500 }
    );

  }

}