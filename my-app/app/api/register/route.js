import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import dbConnect from "@/lib/dbConnect";

import User from "@/models/User";

export async function POST(req) {

  try {

    await dbConnect();

    const body = await req.json();

    const {

      fullName,

      email,

      password,

      role,

    } = body;

    // Check existing user

    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return NextResponse.json(
        {
          message: "Email already exists",
        },
        {
          status: 400,
        }
      );

    }

    // Hash Password

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User

    const newUser = await User.create({

      fullName,

      email,

      password: hashedPassword,

      role,

    });

    return NextResponse.json({

      message: "Account Created",

      user: newUser,

    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        message: "Registration Failed",
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }

}