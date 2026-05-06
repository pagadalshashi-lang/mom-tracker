import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Task from "@/models/Task";

const MONGODB_URI = process.env.MONGODB_URI;

// DB Connect

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

    await Task.findByIdAndUpdate(
      params.id,
      body
    );

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json({
      success: false,
    });

  }

}