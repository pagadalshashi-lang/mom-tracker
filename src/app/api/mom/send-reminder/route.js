import { NextResponse } from "next/server";
import { sendMail } from "@/lib/sendMail";

export async function POST(req) {
  try {

    const task = await req.json();

    const emails = [
      task.fprEmail,
      task.fprPersonalEmail,
      task.sprEmail,
      task.sprPersonalEmail,
    ].filter(Boolean);

    if (emails.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No Email Found",
      });
    }

    await sendMail({
      to: emails.join(","),

      subject: `MOM Reminder - ${task.mainPoint}`,

      html: `
        <h2>MOM Reminder</h2>

        <table border="1" cellpadding="8" cellspacing="0">

          <tr>
            <td><b>Main Point</b></td>
            <td>${task.mainPoint || "-"}</td>
          </tr>

          <tr>
            <td><b>Sub Point</b></td>
            <td>${task.subPoint || "-"}</td>
          </tr>

          <tr>
            <td><b>FPR</b></td>
            <td>${task.fpr || "-"}</td>
          </tr>

          <tr>
            <td><b>SPR</b></td>
            <td>${task.spr || "-"}</td>
          </tr>

          <tr>
            <td><b>Status</b></td>
            <td>${task.status || "-"}</td>
          </tr>

          <tr>
            <td><b>Plan End Date</b></td>
            <td>${task.planEndDate || "-"}</td>
          </tr>

          <tr>
            <td><b>Remark</b></td>
            <td>${task.remark || "-"}</td>
          </tr>

        </table>

        <br/>

        <p>
          Please update the MOM action status.
        </p>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "Reminder Sent Successfully",
    });

  } catch (error) {

    console.error(error);

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