import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import User from "@/models/User";
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

   const email = searchParams.get("email");
const view = searchParams.get("view") || "my";

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

   let data = [];

if (view === "my") {

  data = await MomAction.find({
    uploadedByEmail: email,
  }).sort({
    createdAt: -1,
  });

} else {

  // Logged In User

  const loggedUser = await User.findOne({
    email,
  });

  if (!loggedUser) {
    return NextResponse.json({
      success: false,
      message: "User not found",
    });
  }

  // Same Support Role Team

  const teamUsers = await User.find({
    supportRole: loggedUser.supportRole,
    email: { $ne: email }, // Exclude current user
  });

  const teamEmails = teamUsers
    .map((u) => u.email)
    .filter(Boolean);

  data = await MomAction.find({
    uploadedByEmail: {
      $in: teamEmails,
    },
  }).sort({
    createdAt: -1,
  });

}

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