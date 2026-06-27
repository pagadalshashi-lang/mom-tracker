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
          message: "Email required",
        },
        {
          status: 400,
        }
      );
    }

   let actions = [];

if (view === "my") {

  actions = await MomAction.find({
    $or: [
      { fprEmail: email },
      { sprEmail: email },
      { fprPersonalEmail: email },
      { sprPersonalEmail: email },
    ],
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

  // Same Support Role Users

  const teamUsers = await User.find({
    supportRole: loggedUser.supportRole,
    email: { $ne: email }, // Exclude logged user
  });

  const teamEmails = [];

  teamUsers.forEach((u) => {
    if (u.email) {
      teamEmails.push(u.email);
    }
  });

  actions = await MomAction.find({
    $or: [
      { fprEmail: { $in: teamEmails } },
      { sprEmail: { $in: teamEmails } },
      { fprPersonalEmail: { $in: teamEmails } },
      { sprPersonalEmail: { $in: teamEmails } },
    ],
  }).sort({
    createdAt: -1,
  });

}

    return NextResponse.json({
      success: true,
      data: actions,
    });
  } catch (error) {
    console.error(
      "MY ACTION ERROR:",
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