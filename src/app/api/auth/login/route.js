import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }
console.log("Email:", email);
console.log("Password Entered:", password);
console.log("Password from DB:", user.password);
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Password",
        },
        {
          status: 401,
        }
      );
    }

   console.log("Is Match:", isMatch);
    return NextResponse.json({
  success: true,
  message: "Login Successful",

  user: {
    employeeCode: user.employeeCode,
    name: user.name,
    email: user.email,
    supportRole: user.supportRole,
  },
});

  
  } catch (error) {

    console.error(
      "LOGIN ERROR:",
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