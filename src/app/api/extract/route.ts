import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please select a PDF file." }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large. Maximum size is 10 MB." }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await pdf(buffer);
    const text = result.text.replace(/\u0000/g, "").trim();

    if (!text) {
      return NextResponse.json(
        { error: "No selectable text found. This may be a scanned PDF; OCR is not included yet." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text,
      pages: result.numpages,
      fileName: file.name,
      characters: text.length,
    });
  } catch (error) {
    console.error("PDF extraction error:", error);
    return NextResponse.json({ error: "Could not read this PDF. Please try another file." }, { status: 500 });
  }
}
