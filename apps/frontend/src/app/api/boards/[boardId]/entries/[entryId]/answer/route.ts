import { NextResponse } from "next/server";
import { callAPIWithAuth } from "@/app/lib/api/http";

type RouteHandlerContext = {
  params: Promise<{
    boardId: string;
    entryId: string;
  }>;
};

export async function POST(request: Request, context: RouteHandlerContext) {
  const body = await request.text();
  const { boardId, entryId } = await context.params;

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
