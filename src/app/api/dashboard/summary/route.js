import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

export async function GET(req) {
try {
await connectDB();


const { searchParams } =
  new URL(req.url);

const email =
  searchParams.get("email");

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

// MOM Uploaded By Me

const assignedMom =
  await MomAction.find({
    uploadedByEmail: email,
  });

// MOM Assigned To Me

const selfMom =
  await MomAction.find({
    $or: [
      {
        fprEmail: email,
      },
      {
        sprEmail: email,
      },
      {
        fprPersonalEmail: email,
      },
      {
        sprPersonalEmail: email,
      },
    ],
  });

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
