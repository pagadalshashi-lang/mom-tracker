import { NextResponse } from "next/server";

import mongoose from "mongoose";

import Task from "@/models/Task";

const MONGODB_URI = process.env.MONGODB_URI;

// DATABASE CONNECT

async function connectDB() {

  if (mongoose.connections[0].readyState) {

    return;

  }

  await mongoose.connect(MONGODB_URI);

}

// UPDATE TASK

export async function PUT(req, { params }) {

  try {

    await connectDB();

    const body = await req.json();

    const updatedTask = await Task.findByIdAndUpdate(

      params.id,

      {

        status: body.status,

        actualStartDate:
          body.actualStartDate,

        actualEndDate:
          body.actualEndDate,

        remark:
          body.remark,

      },

      {
        new: true,
      }

    );

    return NextResponse.json({

      success: true,

      task: updatedTask,

    });

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