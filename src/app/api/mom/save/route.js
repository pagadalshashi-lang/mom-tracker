import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";
import { sendMail } from "@/lib/sendMail";

export async function POST(req) {
  try {
    await connectDB();

    const { rows, createdBy, createdByEmail } = await req.json();

    console.log("Received Data:");
    console.log(rows);

    const formattedData = rows.map((row) => ({
      // Uploaded User
      uploadedBy: createdBy,
      uploadedByEmail: createdByEmail,

      // MOM
      account: row.Account,
      mainPoint: row["Main Point"],
      subPoint: row["Sub Point"],

      // Responsibility
      fpr: row.FPR,
      spr: row.SPR,
      external: row.External,

      // Emails
      fprEmail: row.FPR_EMAIL,
      fprPersonalEmail: row.FPR_PERSONAL_EMAIL,
      sprEmail: row.SPR_EMAIL,
      sprPersonalEmail: row.SPR_PERSONAL_EMAIL,

      // Dates
      planStartDate: row["Plan Start Date"],
      actualStartDate: row["Actual Start Date"] || "",
      planEndDate: row["Plan End Date"],
      actualEndDate: row["Actual End Date"] || "",

      // Status
      status: row.Status || "Open",

      remark: row.Remarks || row.Remark || "",
    }));

    // ==========================
    // VALIDATION
    // ==========================

    const validRows = [];
    const invalidRows = [];

    formattedData.forEach((row, index) => {
      const errors = [];

      if (!row.account) errors.push("Account Missing");
      if (!row.mainPoint) errors.push("Main Point Missing");
      if (!row.subPoint) errors.push("Sub Point Missing");
      if (!row.fpr) errors.push("FPR Missing");
      if (!row.spr) errors.push("SPR Missing");
      if (!row.planStartDate) errors.push("Plan Start Date Missing");
      if (!row.planEndDate) errors.push("Plan End Date Missing");
      if (!row.status) errors.push("Status Missing");

      if (row.status && row.status.trim().toLowerCase() === "closed") {
        if (!row.actualStartDate) errors.push("Actual Start Date Missing");
        if (!row.actualEndDate) errors.push("Actual End Date Missing");
        if (!row.remark) errors.push("Remarks Missing");
      }

      // HRMS Validation
      if (!row.fprEmail && !row.fprPersonalEmail) {
        errors.push("FPR not found in HRMS");
      }
      if (!row.sprEmail && !row.sprPersonalEmail) {
        errors.push("SPR not found in HRMS");
      }

      if (errors.length > 0) {
        invalidRows.push({
          index,
          rowNumber: index + 2,
          account: row.account,
          mainPoint: row.mainPoint,
          subPoint: row.subPoint,
          fpr: row.fpr,
          spr: row.spr,
          errors,
        });
      } else {
        // IMPORTANT: spread the actual row data instead of nesting it under
        // a `row` key — the duplicate check and insertMany below need to
        // read account/mainPoint/subPoint/etc directly off this object.
        validRows.push({
          ...row,
          index,
          rowNumber: index + 2,
        });
      }
    });

    // ==========================
    // DUPLICATE CHECK + SAVE
    // ==========================

    const rowsToSave = [];

    for (const row of validRows) {
      const exists = await MomAction.findOne({
        account: row.account,
        mainPoint: row.mainPoint,
        subPoint: row.subPoint,
        uploadedByEmail: row.uploadedByEmail,
      });

      if (!exists) {
        // Strip the helper fields (index/rowNumber) before inserting —
        // they aren't part of the MomAction schema.
        const { index, rowNumber, ...docToSave } = row;
        rowsToSave.push(docToSave);
      } else {
        invalidRows.push({
          index: row.index,
          rowNumber: row.rowNumber,
          account: row.account,
          mainPoint: row.mainPoint,
          subPoint: row.subPoint,
          fpr: row.fpr,
          spr: row.spr,
          errors: ["MOM already exists"],
        });
      }
    }

    let savedRows = [];

    if (rowsToSave.length > 0) {
      savedRows = await MomAction.insertMany(rowsToSave);
    }

    for (const row of savedRows) {
      const emails = [
        ...new Set(
          [
            row.fprEmail,
            row.fprPersonalEmail,
            row.sprEmail,
            row.sprPersonalEmail,
          ].filter(Boolean)
        ),
      ];

      if (emails.length > 0) {
        try {
          await sendMail({
            to: emails.join(","),
            subject: `New MOM Assigned - ${row.mainPoint}`,
            html: `
              <h2>New MOM Assigned</h2>
              <p><b>Account:</b> ${row.account}</p>
              <p><b>Main Point:</b> ${row.mainPoint}</p>
              <p><b>Sub Point:</b> ${row.subPoint}</p>
              <p><b>FPR:</b> ${row.fpr}</p>
              <p><b>SPR:</b> ${row.spr}</p>
              <p><b>Status:</b> ${row.status}</p>
              <p><b>Plan End Date:</b> ${row.planEndDate}</p>
              <p><b>Uploaded By:</b> ${row.uploadedBy}</p>
              <br/>
              <p>A new MOM task has been assigned to you.</p>
            `,
          });
        } catch (mailError) {
          console.error("Mail Error:", mailError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      savedCount: savedRows.length,
      invalidCount: invalidRows.length,
      invalidRows,
      message: `${savedRows.length} rows uploaded successfully`,
    });
  } catch (error) {
    console.error("SAVE ERROR:", error);

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