# PaperMind — AI PDF Summarizer

A small full-stack BTech project built with Next.js, Tailwind CSS, shadcn-style UI components, and Gemini AI. It has no database or login.

## Requirements

- Node.js 20.9 or newer
- npm
- A Gemini API key

## Run locally

1. Extract the ZIP and open the project folder in VS Code/Cursor.
2. Install packages:

   ```bash
   npm install
   ```

3. Create `.env.local` in the project root:

   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

Get a Gemini API key from Google AI Studio: https://aistudio.google.com/apikey

## Features

- Upload PDF files (10 MB maximum)
- Extract selectable PDF text on the server
- Generate a structured AI summary
- Ask questions about the uploaded document
- No database, authentication, or permanent file storage

## Architecture

- `src/app/page.tsx` — client UI and temporary in-memory state
- `src/app/api/extract/route.ts` — validates and extracts PDF text
- `src/app/api/ai/route.ts` — calls Gemini for summary and Q&A
- `src/components/ui/` — reusable shadcn-inspired UI primitives

## Notes / limitations

- Scanned/image-only PDFs need OCR; OCR is not included.
- The demo limits PDFs to 10 MB and extracted text to 80,000 characters.
- The PDF text is sent to Gemini when you request a summary or answer. Do not upload confidential documents.
- No document history is saved. Refreshing the page clears the current session.
- For production, add rate limiting, stricter request-size limits, authentication if needed, and a privacy notice.

## Is a database needed?

No. The app keeps the extracted text and generated output in browser memory only. Add a database later only if you want user accounts, saved documents, history, or sharing.
