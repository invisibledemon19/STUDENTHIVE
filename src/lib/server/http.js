import { NextResponse } from 'next/server';

export function badRequest(message) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 400 }
  );
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 403 }
  );
}

export function conflict(message) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 409 }
  );
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 500 }
  );
}

export async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime());
}

export function isValidTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value || ''));
}

export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function normalizeCondition(condition) {
  const value = String(condition || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');

  const allowed = new Set(['new', 'like_new', 'good', 'fair', 'poor']);
  return allowed.has(value) ? value : null;
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    verified: Boolean(user.verified),
    trustScore: user.trustScore ?? 5,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLogin: user.lastLogin,
  };
}
