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

    // ============================
    // GET SUPPORT ROLE FROM HRMS
    // ============================

    let supportRole = "";

    try {
      const hrmsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/hrms`
      );

      const employees = await hrmsResponse.json();

      const emp = employees.find(
        (x) =>
          x.email?.toLowerCase() ===
          email.toLowerCase()
      );

      if (emp) {
        supportRole =
          emp.supportRole || "";
      }
    } catch (err) {
      console.log(
        "HRMS Error",
        err.message
      );
    }

    return NextResponse.json({
      success: true,
      message: "Login Successful",

      user: {
        employeeCode:
          user.employeeCode,

        name: user.name,

        email: user.email,

        supportRole,
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