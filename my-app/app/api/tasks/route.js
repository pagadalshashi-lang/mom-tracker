import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Task from "@/models/Task";

const MONGODB_URI = process.env.MONGODB_URI;

// Connect DB

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

    const task = await Task.create(body);

    return NextResponse.json(
      {
        success: true,
        task,
      },
      { status: 201 }
    );

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Task Creation Failed",
      },
      { status: 500 }
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