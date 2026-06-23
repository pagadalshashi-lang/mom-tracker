import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import { sendMail } from "@/lib/sendMail";

export async function POST(req) {
  try {
    await connectDB();

    const {
      rows,
      createdBy,
      createdByEmail,
    } = await req.json();

    console.log("Received Data:");
    console.log(rows);

    const formattedData = rows.map(
      (row) => ({
        // Creator

      // Uploaded User

uploadedBy: createdBy,

uploadedByEmail:
  createdByEmail,

        // MOM

        mainPoint:
          row["Main Point"],

        subPoint:
          row["Sub Point"],

        // Responsibility

        fpr: row.FPR,
        spr: row.SPR,

        external:
          row.External,

        // Emails

        fprEmail:
          row.FPR_EMAIL,

        fprPersonalEmail:
          row.FPR_PERSONAL_EMAIL,

        sprEmail:
          row.SPR_EMAIL,

        sprPersonalEmail:
          row.SPR_PERSONAL_EMAIL,

        // Dates

        planStartDate:
          row["Plan Start Date"],

       actualStartDate: "",
        planEndDate:
          row["Plan End Date"],

      actualEndDate: "",

        // Status

        status:
          row.Status || "Open",

        remark:
          row.Remark || "",
      })
    );

    // ==========================
    // VALIDATION
    // ==========================

    const validRows = [];
    const invalidRows = [];

    formattedData.forEach(
      (row, index) => {

        const errors = [];

        if (!row.mainPoint)
          errors.push(
            "Main Point Missing"
          );

        if (!row.subPoint)
          errors.push(
            "Sub Point Missing"
          );

        if (!row.fpr)
          errors.push(
            "FPR Missing"
          );

        if (!row.spr)
          errors.push(
            "SPR Missing"
          );

        if (!row.planStartDate)
          errors.push(
            "Plan Start Date Missing"
          );

        if (!row.planEndDate)
          errors.push(
            "Plan End Date Missing"
          );

        if (!row.status)
          errors.push(
            "Status Missing"
          );

        // HRMS Validation

       if (
  !row.fprEmail &&
  !row.fprPersonalEmail
) {
  errors.push(
    "FPR not found in HRMS"
  );
}
      if (
  !row.sprEmail &&
  !row.sprPersonalEmail
) {
  errors.push(
    "SPR not found in HRMS"
  );
}
        if (errors.length > 0) {

          invalidRows.push({
            rowNumber:
              index + 1,

            mainPoint:
              row.mainPoint,

            fpr:
              row.fpr,

            spr:
              row.spr,

            errors,
          });

        } else {

          validRows.push(row);

        }
      }
    );

    // ==========================
    // SAVE VALID ROWS
    // ==========================

   if (validRows.length > 0) {

  const savedRows =
    await MomAction.insertMany(
      validRows
    );

  for (const row of savedRows) {

    const emails = [
      row.fprEmail,
      row.fprPersonalEmail,
      row.sprEmail,
      row.sprPersonalEmail,
    ].filter(Boolean);

    if (emails.length > 0) {

      try {

        await sendMail({
          to: emails.join(","),

          subject: `New MOM Assigned - ${row.mainPoint}`,

          html: `
            <h2>New MOM Assigned</h2>

            <p><b>Main Point:</b> ${row.mainPoint}</p>

            <p><b>Sub Point:</b> ${row.subPoint}</p>

            <p><b>FPR:</b> ${row.fpr}</p>

            <p><b>SPR:</b> ${row.spr}</p>

            <p><b>Status:</b> ${row.status}</p>

            <p><b>Plan End Date:</b> ${row.planEndDate}</p>

            <p><b>Uploaded By:</b> ${row.uploadedBy}</p>

            <br/>

            <p>
              A new MOM task has been assigned to you.
            </p>
          `,
        });

      } catch (mailError) {

        console.error(
          "Mail Error:",
          mailError
        );

      }

    }
  }

}

    return NextResponse.json({
      success: true,

      savedCount:
        validRows.length,

      invalidCount:
        invalidRows.length,

      invalidRows,

      message:
        `${validRows.length} rows uploaded successfully`,
    });

  } catch (error) {

    console.error(
      "SAVE ERROR:",
      error
    );

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