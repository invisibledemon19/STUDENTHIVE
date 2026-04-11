import { NextResponse } from 'next/server';
export async function POST(request) {
  const { email, otp } = await request.json();
  if (!email || !otp || otp.length !== 6) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  const user = { id: crypto.randomUUID(), email, name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), verified: true };
  return NextResponse.json({ success: true, user });
}
