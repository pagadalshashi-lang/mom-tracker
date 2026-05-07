import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";

import User from "@/models/User";

export async function POST(req) {

  try {

    await dbConnect();

    const body = await req.json();

    const { email, password } = body;

    // Find User

    const user = await User.findOne({ email });

    if (!user) {

      return NextResponse.json(
        {
          message: "User not found",
        },
        {
          status: 404,
        }
      );

    }

    // Compare Password

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {

      return NextResponse.json(
        {
          message: "Invalid Email or Password",
        },
        {
          status: 401,
        }
      );

    }

    return NextResponse.json({
      message: "Login Successful",
      user,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        message: error.message,
      },
      {
        status: 500,
      }
    );

  }

}