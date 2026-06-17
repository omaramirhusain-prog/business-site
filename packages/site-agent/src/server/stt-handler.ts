import { NextResponse } from "next/server";

export type CreateSttHandlerOptions = {
  /** OpenAI Whisper model */
  model?: string;
};

export function createSttHandler(options: CreateSttHandlerOptions = {}) {
  const model = options.model ?? "whisper-1";

  return async function POST(req: Request) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured for STT fallback" },
        { status: 503 }
      );
    }

    const form = await req.formData();
    const audio = form.get("audio");
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Missing audio" }, { status: 400 });
    }

    const body = new FormData();
    body.append("file", audio, "audio.webm");
    body.append("model", model);
    body.append("language", "en");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body,
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "Transcription failed", detail },
        { status: res.status }
      );
    }

    const data = (await res.json()) as { text?: string };
    return NextResponse.json({ text: data.text?.trim() ?? "" });
  };
}
