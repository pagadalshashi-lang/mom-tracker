import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import { sendMail } from "@/lib/sendMail";

export async function GET() {
  try {
    await connectDB();

    const tasks =
      await MomAction.find({
        status: {
          $ne: "Closed",
        },
      });

    const today =
      new Date();

    for (const task of tasks) {
      if (
        !task.planEndDate
      )
        continue;

      const dueDate =
        new Date(
          task.planEndDate
        );

      const diff =
        Math.ceil(
          (dueDate - today) /
            (1000 *
              60 *
              60 *
              24)
        );

      if (diff <= 2) {
        const emails = [
          task.fprEmail,
          task.fprPersonalEmail,
          task.sprEmail,
          task.sprPersonalEmail,
        ].filter(Boolean);

        if (
          emails.length > 0
        ) {
          await sendMail({
            to:
              emails.join(","),
            subject:
              "MoM Reminder",

            html: `
              <h3>MOM Reminder</h3>

              <p>
                Main Point:
                ${task.mainPoint}
              </p>

              <p>
                Status:
                ${task.status}
              </p>

              <p>
                Due Date:
                ${task.planEndDate}
              </p>
            `,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
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