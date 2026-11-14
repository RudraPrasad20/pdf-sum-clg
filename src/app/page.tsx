"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight, Bot, Check, FileText, FileUp, Loader2, MessageCircle,
  RefreshCw, Sparkles, UploadCloud, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type DocumentInfo = {
  text: string;
  pages: number;
  fileName: string;
  characters: number;
};

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<DocumentInfo | null>(null);
  const [summary, setSummary] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [uploading, setUploading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file?: File) {
    if (!file) return;
    setError("");
    setSummary("");
    setAnswer("");
    setDocument(null);

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/extract", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setDocument(result as DocumentInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function generateSummary() {
    if (!document) return;
    setError("");
    setSummarizing(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "summarize", text: document.text }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not generate summary.");
      setSummary(result.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setSummarizing(false);
    }
  }

  async function askQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!document || !question.trim()) return;
    setError("");
    setAsking(true);
    setAnswer("");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ask", text: document.text, question }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not answer your question.");
      setAnswer(result.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
    } finally {
      setAsking(false);
    }
  }

  function reset() {
    setDocument(null);
    setSummary("");
    setAnswer("");
    setQuestion("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 sm:px-8">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <Sparkles size={19} />
          </div>
          <span className="text-lg font-semibold tracking-tight">PaperMind</span>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-medium text-zinc-500">BETA</span>
        </div>
        <span className="hidden text-xs text-zinc-500 sm:block">Your documents, understood.</span>
      </nav>

      <section className="mx-auto max-w-3xl pb-12 pt-16 text-center sm:pt-20">
        <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3 py-1.5 text-xs text-blue-300">
          <Sparkles size={13} /> AI-powered document assistant
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Make sense of <span className="text-blue-400">any PDF.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
          Upload a document, get the important points in seconds, and ask questions in plain English.
        </p>
      </section>

      {!document ? (
        <Card
          className={`mx-auto max-w-2xl border-dashed p-8 text-center transition sm:p-12 ${dragging ? "border-blue-400 bg-blue-400/[0.06]" : "border-white/15"}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); void uploadFile(e.dataTransfer.files[0]); }}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            {uploading ? <Loader2 className="animate-spin" size={25} /> : <UploadCloud size={26} />}
          </div>
          <h2 className="mt-5 text-lg font-semibold">{uploading ? "Reading your document..." : "Drop your PDF here"}</h2>
          <p className="mt-2 text-sm text-zinc-500">or choose a file from your device</p>
          <div className="mt-6">
            <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
              <FileUp size={16} /> Choose PDF
            </Button>
            <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => void uploadFile(e.target.files?.[0])} />
          </div>
          <p className="mt-5 text-xs text-zinc-600">PDF only · Maximum file size 10 MB</p>
        </Card>
      ) : (
        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="h-fit p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-3 text-red-400"><FileText size={22} /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{document.fileName}</p>
                  <p className="mt-1 text-xs text-zinc-500">{document.pages} pages · {document.characters.toLocaleString()} characters</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} aria-label="Remove document"><X size={16} /></Button>
            </div>
            <div className="mt-5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] p-3 text-xs text-emerald-300">
              <Check className="mr-1 inline" size={14} /> PDF text extracted successfully
            </div>
            <Button className="mt-4 w-full" onClick={generateSummary} disabled={summarizing}>
              {summarizing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {summarizing ? "Generating..." : summary ? "Regenerate summary" : "Generate AI summary"}
            </Button>
          </Card>

          <div className="space-y-5">
            {summary ? (
              <Card className="p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><Sparkles className="text-blue-400" size={17} /> Document summary</div>
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-7 text-zinc-300">{summary}</div>
              </Card>
            ) : (
              <Card className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
                <Bot size={28} className="text-zinc-600" />
                <p className="mt-3 text-sm font-medium text-zinc-300">Your summary will appear here</p>
                <p className="mt-1 text-xs text-zinc-500">Click Generate AI summary to get started.</p>
              </Card>
            )}

            <Card className="p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><MessageCircle className="text-blue-400" size={17} /> Ask your document</div>
              <form onSubmit={askQuestion} className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What are the main findings?"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-400/60"
                />
                <Button type="submit" disabled={asking || !question.trim()}>
                  {asking ? <Loader2 className="animate-spin" size={15} /> : <>Ask <ArrowUpRight size={15} /></>}
                </Button>
              </form>
              {answer && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-zinc-300 whitespace-pre-wrap">{answer}</div>}
            </Card>
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto mt-5 flex max-w-2xl items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button>
        </div>
      )}

      <footer className="mx-auto mt-16 max-w-5xl border-t border-white/[0.07] py-6 text-center text-xs text-zinc-600">
        PaperMind · Built with Next.js and Gemini AI · Your files are not saved to a database.
      </footer>
    </main>
  );
}
