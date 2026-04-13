import { NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/server/auth';
import { updateDatabase } from '@/lib/server/database';
import {
  badRequest,
  normalizeEmail,
  isValidEmail,
  parseJsonBody,
  sanitizeUser,
  serverError,
  unauthorized,
} from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function deriveNameFromEmail(email) {
  const namePart = email.split('@')[0] || '';
  return namePart
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export async function POST(request) {
  const body = await parseJsonBody(request);

  if (!body) {
    return badRequest('Invalid JSON body');
  }

  const email = normalizeEmail(body.email);
  const otp = String(body.otp || '').trim();
  const providedName = typeof body.name === 'string' ? body.name.trim() : '';

  if (!isValidEmail(email)) {
    return badRequest('Please provide a valid email address');
  }

  if (!/^\d{6}$/.test(otp)) {
    return badRequest('OTP must be a 6-digit code');
  }

  try {
    let sessionData = null;
    let otpFailure = null;

    await updateDatabase((db) => {
      const now = Date.now();

      const otpRecord = db.otpCodes
        .filter((entry) => entry.email === email && !entry.used)
        .sort(
          (left, right) =>
            new Date(right.createdAt).getTime() -
            new Date(left.createdAt).getTime()
        )[0];

      if (!otpRecord) {
        otpFailure = 'No OTP request found for this email';
        return db;
      }

      const expired = new Date(otpRecord.expiresAt).getTime() < now;

      if (expired) {
        otpFailure = 'OTP has expired. Please request a new one';
        return db;
      }

      if (otpRecord.code !== otp) {
        otpRecord.attempts = (otpRecord.attempts || 0) + 1;
        otpFailure = 'Incorrect OTP';
        return db;
      }

      otpRecord.used = true;
      otpRecord.usedAt = new Date(now).toISOString();

      const existingUser = db.users.find((entry) => entry.email === email);

      if (existingUser) {
        existingUser.verified = true;
        existingUser.updatedAt = new Date(now).toISOString();
        existingUser.lastLogin = new Date(now).toISOString();
        // Update name if a new one was provided during login
        if (providedName) {
          existingUser.name = providedName;
        }
      } else {
        db.users.push({
          id: crypto.randomUUID(),
          email,
          name: providedName || deriveNameFromEmail(email),
          verified: true,
          trustScore: 5,
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
          lastLogin: new Date(now).toISOString(),
        });
      }

      const user = db.users.find((entry) => entry.email === email);
      const token = createSessionToken(user);

      sessionData = {
        token,
        user: sanitizeUser(user),
      };

      return db;
    });

    if (!sessionData) {
      return unauthorized(otpFailure || 'Unable to verify OTP');
    }

    return NextResponse.json({
      success: true,
      ...sessionData,
    });
  } catch (error) {
    console.error('verify-otp failure', error);
    return serverError('Unable to verify OTP right now');
  }
}
