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

const status =
  searchParams.get("status");

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

let filter = {
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
};

if (
  status &&
  status !== "All"
) {
  filter.status = status;
}

const data =
  await MomAction.find(
    filter
  ).sort({
    createdAt: -1,
  });

const summary = {
  total: data.length,

  open: data.filter(
    (x) =>
      x.status === "Open"
  ).length,

  inProcess:
    data.filter(
      (x) =>
        x.status ===
        "In Process"
    ).length,

  pending:
    data.filter(
      (x) =>
        x.status ===
        "Pending"
    ).length,

  closed:
    data.filter(
      (x) =>
        x.status ===
        "Closed"
    ).length,
};

return NextResponse.json({
  success: true,
  data,
  summary,
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
