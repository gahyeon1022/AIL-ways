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

  const formData = await request.formData();
  if (!formData.has('file')) {
    return NextResponse.json({ message: 'file 필드가 필요합니다.' }, { status: 400 });
  }

  const { sessionId } = await context.params;
  const backendResponse = await fetch(
    `${BE}/api/sessions/${encodeURIComponent(sessionId)}/distractions/analyze`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  return new NextResponse(backendResponse.body, {
    status: backendResponse.status,
    headers: {
      'content-type': backendResponse.headers.get('content-type') ?? 'application/json',
    },
  });
}
