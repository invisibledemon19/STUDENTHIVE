import { NextResponse } from 'next/server';
import { updateDatabase } from '@/lib/server/database';
import {
  badRequest,
  normalizeEmail,
  isValidEmail,
  parseJsonBody,
  serverError,
} from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(request) {
  const body = await parseJsonBody(request);

  if (!body) {
    return badRequest('Invalid JSON body');
  }

  const email = normalizeEmail(body.email);

  if (!isValidEmail(email)) {
    return badRequest('Please provide a valid email address');
  }

  try {
    const otp = generateOtp();
    const now = Date.now();
    const expiresAt = new Date(now + 2 * 60 * 1000).toISOString();

    await updateDatabase((db) => {
      db.otpCodes = db.otpCodes.filter(
        (entry) => entry.email !== email || entry.used
      );

      db.otpCodes.push({
        id: crypto.randomUUID(),
        email,
        code: otp,
        expiresAt,
        used: false,
        attempts: 0,
        createdAt: new Date(now).toISOString(),
      });

      return db;
    });

    return NextResponse.json({
      success: true,
      message: 'OTP generated successfully',
      expiresAt,
      // Keep local development flow usable without integrating a real mail provider.
      demoOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
    });
  } catch (error) {
    console.error('send-otp failure', error);
    return serverError('Unable to generate OTP right now');
  }
}
