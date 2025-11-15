import { NextRequest, NextResponse } from "next/server";
import { callAPIWithAuth } from "@/app/lib/api/http";

export async function PATCH(
  _request: NextRequest,
  context: { params: { boardId: string; entryId: string } }
) {
  const { boardId, entryId } = context.params;
  try {
    const result = await callAPIWithAuth(
      `/api/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}/complete`,
      { method: "PATCH" }
    );
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to complete entry";
    return NextResponse.json({ success: false, error: { message } }, { status: 500 });
  }
}
