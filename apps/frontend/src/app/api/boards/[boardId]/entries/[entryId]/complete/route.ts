import { NextResponse } from "next/server";
import { callAPIWithAuth } from "@/app/lib/api/http";

type RouteHandlerContext = {
  params: Promise<{
    boardId: string;
    entryId: string;
  }>;
};

export async function PATCH(_request: Request, context: RouteHandlerContext) {
  const { boardId, entryId } = await context.params;
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
