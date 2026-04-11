import { NextResponse } from 'next/server';
const otpStore = new Map();
export async function POST(request) {
  const { email } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(email, { otp, expiresAt: Date.now() + 120000 });
  return NextResponse.json({ success: true, message: 'OTP sent', demo_otp: otp });
}
