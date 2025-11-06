import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { BE } from '@/app/lib/server/env';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('AUTH_TOKEN')?.value;
  if (!token) {
    return NextResponse.json({ message: '인증 필요' }, { status: 401 });
  }

  const body = await request.text();
  const { sessionId } = await context.params;

  const backendResponse = await fetch(
    `${BE}/api/sessions/${encodeURIComponent(sessionId)}/distractions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    }
  );

  const responseBody = await backendResponse.text();

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: {
      'content-type': backendResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}
