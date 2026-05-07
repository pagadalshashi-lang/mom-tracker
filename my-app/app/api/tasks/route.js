import { NextResponse } from "next/server";

import mongoose from "mongoose";

import Task from "@/models/Task";

const MONGODB_URI = process.env.MONGODB_URI;

// CONNECT DATABASE

async function connectDB() {

  if (mongoose.connections[0].readyState) {

    return;

  }

  await mongoose.connect(MONGODB_URI);

}

// CREATE TASK

export async function POST(req) {

  try {

    await connectDB();

    const body = await req.json();

    const task = await Task.create({

      account: body.account,

      mainPoint: body.mainPoint,

      subPoint: body.subPoint,

      fpr: body.fpr,

      spr: body.spr,

      external: body.external,

      plannedStartDate: body.plannedStartDate,

      plannedEndDate: body.plannedEndDate,

      actualStartDate: body.actualStartDate || "",

      actualEndDate: body.actualEndDate || "",

      status: body.status || "Pending",

      remark: body.remark || "",

      createdBy: body.createdBy,

    });

    return NextResponse.json(
      {
        success: true,
        task,
      },
      {
        status: 201,
      }
    );

  } catch (error) {

    console.log(error);

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

// GET TASKS

export async function GET() {

  try {

    await connectDB();

    const tasks = await Task.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(tasks);

  } catch (error) {

    console.log(error);

    return NextResponse.json([]);

  }

}