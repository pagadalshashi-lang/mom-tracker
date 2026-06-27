import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import User from "@/models/User";

export async function GET(req) {
try {
await connectDB();


const { searchParams } =
  new URL(req.url);

const email =
  searchParams.get("email");
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
let assignedMom = [];
let selfMom = [];

if (view === "my") {

  assignedMom = await MomAction.find({
    uploadedByEmail: email,
  });

  selfMom = await MomAction.find({
    $or: [
      { fprEmail: email },
      { sprEmail: email },
      { fprPersonalEmail: email },
      { sprPersonalEmail: email },
    ],
  });

} else {

  // Logged-in user

  const loggedUser = await User.findOne({
    email,
  });

  if (!loggedUser) {
    return NextResponse.json({
      success: false,
      message: "User not found",
    });
  }

  // Same support role users

  const teamUsers = await User.find({
    supportRole: loggedUser.supportRole,
    email: { $ne: email }, // Exclude current user
  });

  const teamEmails = teamUsers
    .map((u) => u.email)
    .filter(Boolean);

  // Team uploaded MOM

  assignedMom = await MomAction.find({
    uploadedByEmail: {
      $in: teamEmails,
    },
  });

  // Team assigned MOM

  selfMom = await MomAction.find({
    $or: [
      { fprEmail: { $in: teamEmails } },
      { sprEmail: { $in: teamEmails } },
      { fprPersonalEmail: { $in: teamEmails } },
      { sprPersonalEmail: { $in: teamEmails } },
    ],
  });

}
const getStatusCount = (
  data,
  status
) =>
  data.filter(
    (x) => x.status === status
  ).length;

return NextResponse.json({
  success: true,

  assignedCount:
    assignedMom.length,

  selfCount:
    selfMom.length,

  assignedStatus: {
    open:
      getStatusCount(
        assignedMom,
        "Open"
      ),

    inProcess:
      getStatusCount(
        assignedMom,
        "In Process"
      ),

    pending:
      getStatusCount(
        assignedMom,
        "Pending"
      ),

    closed:
      getStatusCount(
        assignedMom,
        "Closed"
      ),
  },

  selfStatus: {
    open:
      getStatusCount(
        selfMom,
        "Open"
      ),

    inProcess:
      getStatusCount(
        selfMom,
        "In Process"
      ),

    pending:
      getStatusCount(
        selfMom,
        "Pending"
      ),

    closed:
      getStatusCount(
        selfMom,
        "Closed"
      ),
  },
});


} catch (error) {
console.error(error);


return NextResponse.json(
  {
    success: false,
    message:
      error.message,
  },
  {
    status: 500,
  }
);


}
}
