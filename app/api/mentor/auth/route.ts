import { NextRequest, NextResponse } from 'next/server';
import { createMentorToken, isMentorAuthorized, setMentorSessionCookie, clearMentorSessionCookie } from '@/lib/mentor-auth';

export async function GET(request: NextRequest) {
  const authenticated = isMentorAuthorized(request);
  return NextResponse.json({ authenticated });
}

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    const masterKey = process.env.MENTOR_MASTER_KEY;

    if (!masterKey) {
      return NextResponse.json(
        { error: 'MENTOR_MASTER_KEY is not configured on Vercel.' },
        { status: 500 }
      );
    }

    if (!key || typeof key !== 'string' || key.trim() !== masterKey.trim()) {
      return NextResponse.json(
        { error: 'Invalid Mentor Master Key' },
        { status: 401 }
      );
    }

    const token = createMentorToken();
    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' });
    setMentorSessionCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Authentication failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  clearMentorSessionCookie(response);
  return response;
}
