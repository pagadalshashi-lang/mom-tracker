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

    const { name, email, password } = body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );

    }

    const newUser = await User.create({
      name,
      email,
      password,
    });

    return NextResponse.json(
      {
        message: "User Created",
        user: newUser,
      },
      { status: 201 }
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { message: "Registration Failed" },
      { status: 500 }
    );

  }

}