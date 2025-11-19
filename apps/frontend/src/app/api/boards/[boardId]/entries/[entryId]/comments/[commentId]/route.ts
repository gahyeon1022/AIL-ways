import { NextRequest } from "next/server";
import { callAPIWithAuth } from "@/app/lib/api/http";

type RouteContext = {
  params: Promise<{
    boardId: string;
    entryId: string;
    commentId: string;
  }>;
};

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { boardId, entryId, commentId } = await params;
  const body = await req.text();
  const data = await callAPIWithAuth(
    `/api/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      body,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return Response.json({ success: true, data });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const { boardId, entryId, commentId } = await params;
  const data = await callAPIWithAuth(
    `/api/boards/${encodeURIComponent(boardId)}/entries/${encodeURIComponent(entryId)}/comments/${encodeURIComponent(commentId)}`,
    {
      method: "DELETE",
    }
  );
  return Response.json({ success: true, data });
}
