import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const {
      employeeCode,
      name,
      email,
      password,
      supportRole, // NEW
    } = await req.json();

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User already registered",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await User.create({
      employeeCode,
      name,
      email,
      supportRole, // NEW
      password: hashedPassword,
    });

    return NextResponse.json({
      success: true,
      message: "Registration Successful",
    });

  } catch (error) {

    console.error("REGISTER ERROR:", error);

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