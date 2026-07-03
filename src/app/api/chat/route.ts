import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/backend";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Proxy the conversation prompts directly to the FastAPI chat backend
    const res = await fetchFromBackend("/api/chat", {
      method: "POST",
      body: JSON.stringify({ messages })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.detail || "Chat failed" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ message: data.message });
  } catch (error) {
    console.error("Chat API proxy error:", error);
    return NextResponse.json({ message: "I'm having a slight connection issue, but I am still listening. How are you holding up?" });
  }
}
