import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

// ======================================
// EXCEL DATE CONVERTER
// ======================================

function excelDateToJSDate(value) {
  if (!value || value === "-") {
    return "";
  }

  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);

    if (!date) return "";

    return `${String(date.d).padStart(2, "0")}/${String(
      date.m
    ).padStart(2, "0")}/${date.y}`;
  }

  return value;
}

// ======================================
// UPLOAD API
// ======================================

export async function POST(req) {
  try {
    const formData =
      await req.formData();

    const file =
      formData.get("file");

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const workbook =
      XLSX.read(buffer, {
        type: "buffer",
      });

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];

    const rawData =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          defval: "",
        }
      );

    // ======================================
    // FORMAT DATA
    // ======================================

    const data =
      rawData.map((row) => ({
        ...row,

        "Plan Start Date":
          excelDateToJSDate(
            row[
              "Plan Start Date"
            ]
          ),

        "Actual Start Date":
          excelDateToJSDate(
            row[
              "Actual Start Date"
            ]
          ),

        "Plan End Date":
          excelDateToJSDate(
            row[
              "Plan End Date"
            ]
          ),

        "Actual End Date":
          excelDateToJSDate(
            row[
              "Actual End Date"
            ]
          ),
      }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "UPLOAD ERROR:",
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