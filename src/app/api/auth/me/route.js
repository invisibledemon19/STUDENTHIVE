import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/server/auth';
import { sanitizeUser, unauthorized } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return unauthorized(auth.error);
  }

  return NextResponse.json({
    success: true,
    user: sanitizeUser(auth.user),
  });
}
