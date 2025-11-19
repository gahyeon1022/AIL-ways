import { NextResponse } from "next/server";
import { callAPIWithAuth } from "@/app/lib/api/http";

export async function POST(
  request: Request,
  { params }: { params: { boardId: string; entryId: string } }
) {
  const body = await request.text();
  const { boardId, entryId } = params;

  try {
    const result = await callAPIWithAuth(`/api/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save answer";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
