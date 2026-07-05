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

  // My MOMs (Assigned to me)

  data = await MomAction.find({
    $or: [
      { fprEmail: email },
      { sprEmail: email },
      { fprPersonalEmail: email },
      { sprPersonalEmail: email },
    ],
  }).sort({
    createdAt: -1,
  });

} else if (view === "uploaded") {

  // Uploaded By Me

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

  // BA & Head BA are one Team

  let supportRoles = [];

  if (
    loggedUser.supportRole === "BA" ||
    loggedUser.supportRole === "Head BA"
  ) {
    supportRoles = [
      "BA",
      "Head BA",
    ];
  } else {
    supportRoles = [
      loggedUser.supportRole,
    ];
  }

  // Same Team Users

  const teamUsers = await User.find({
    supportRole: {
      $in: supportRoles,
    },
  });

  const teamEmails = [];

  teamUsers.forEach((u) => {
    if (u.email) {
      teamEmails.push(u.email);
    }
  });

  data = await MomAction.find({
    $or: [
      { fprEmail: { $in: teamEmails } },
      { sprEmail: { $in: teamEmails } },
      { fprPersonalEmail: { $in: teamEmails } },
      { sprPersonalEmail: { $in: teamEmails } },
      { uploadedByEmail: { $in: teamEmails } },
    ],
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