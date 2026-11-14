import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 80_000;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY. Add it to .env.local and restart the server.");
  return new GoogleGenAI({ apiKey });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, text, question } = body as {
      action?: string;
      text?: string;
      question?: string;
    };

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Document text is missing." }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "This document is too long for the demo (80,000 characters max). Try a shorter PDF." },
        { status: 413 }
      );
    }

    const ai = getClient();
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    let prompt = "";
    if (action === "summarize") {
      prompt = `You are a helpful academic document assistant. Summarize the following PDF in clear, simple English.
Return Markdown with:
1. A one-paragraph overview
2. Key points (bullet list)
3. Important terms or concepts
4. A short conclusion
Do not invent information not present in the document.

DOCUMENT:
${text}`;
    } else if (action === "ask") {
      if (typeof question !== "string" || !question.trim()) {
        return NextResponse.json({ error: "Please enter a question." }, { status: 400 });
      }
      prompt = `Answer the user's question using only the document below. If the answer is not in the document, clearly say that the document does not provide enough information. Keep the answer concise and cite relevant section names or page references only when they are present in the text.

DOCUMENT:
${text}

QUESTION:
${question}`;
    } else {
      return NextResponse.json({ error: "Unsupported AI action." }, { status: 400 });
    }

    const response = await ai.models.generateContent({ model, contents: prompt });
    return NextResponse.json({ answer: response.text || "The AI returned an empty response." });
  } catch (error) {
    console.error("Gemini API error:", error);
    const message = error instanceof Error ? error.message : "AI request failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
