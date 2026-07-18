import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import connectDB from "@/lib/mongodb";
import MomAction from "@/models/MomAction";

/**
 * POST /api/bulk-update-account
 *
 * Accepts a multipart/form-data upload with a "file" field
 * (CSV or Excel). Expects each row to have at least:
 *   - subPoint  (used to find the existing record)
 *   - account   (the value to set on that record)
 *
 * For every row:
 *   - if a MomAction with that subPoint exists -> account is updated
 *   - if not found -> reported back, nothing is created
 *   - if subPoint is missing/blank -> row is skipped
 *
 * Response shape:
 * {
 *   success: true,
 *   results: {
 *     total, updated, notFound, skipped,
 *     details: [ { subPoint, account, status, reason? }, ... ]
 *   }
 * }
 */
export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded. Attach it under the 'file' field." },
        { status: 400 }
      );
    }

    // Read the uploaded file into a buffer XLSX can parse (works for .xlsx, .xls, and .csv)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let rows;
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    } catch (parseErr) {
      return NextResponse.json(
        { success: false, error: "Could not parse the file. Make sure it's a valid CSV/Excel file." },
        { status: 400 }
      );
    }

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "The file has no data rows." },
        { status: 400 }
      );
    }

    // Normalize each row and pull out subPoint/account, tolerating a few header variants
    const parsedRows = rows.map((row) => {
      const subPoint = String(
        row.subPoint ?? row.SubPoint ?? row["Sub Point"] ?? row["sub point"] ?? ""
      ).trim();
      const account = String(row.account ?? row.Account ?? "").trim();
      return { subPoint, account };
    });

    const results = {
      total: parsedRows.length,
      updated: 0,
      notFound: 0,
      skipped: 0,
      details: [],
    };

    // Separate out rows with a usable subPoint
    const validRows = [];
    for (const row of parsedRows) {
      if (!row.subPoint) {
        results.skipped++;
        results.details.push({
          subPoint: row.subPoint || null,
          account: row.account,
          status: "skipped",
          reason: "Missing subPoint",
        });
      } else {
        validRows.push(row);
      }
    }

    if (validRows.length) {
      // Find which of these subPoints actually exist in the DB
      const subPoints = validRows.map((r) => r.subPoint);
      const existingDocs = await MomAction.find(
        { subPoint: { $in: subPoints } },
        { subPoint: 1 }
      ).lean();
      const existingSet = new Set(existingDocs.map((d) => d.subPoint));

      const bulkOps = [];
      for (const row of validRows) {
        if (existingSet.has(row.subPoint)) {
          bulkOps.push({
            updateOne: {
              filter: { subPoint: row.subPoint },
              update: { $set: { account: row.account } },
            },
          });
          results.details.push({
            subPoint: row.subPoint,
            account: row.account,
            status: "updated",
          });
        } else {
          results.notFound++;
          results.details.push({
            subPoint: row.subPoint,
            account: row.account,
            status: "notFound",
            reason: "No matching subPoint in DB",
          });
        }
      }

      if (bulkOps.length) {
        const bulkResult = await MomAction.bulkWrite(bulkOps);
        results.updated = bulkResult.modifiedCount ?? bulkOps.length;
      }
    }

    return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (err) {
    console.error("Bulk update account error:", err);
    return NextResponse.json(
      { success: false, error: "Server error", detail: err.message },
      { status: 500 }
    );
  }
}