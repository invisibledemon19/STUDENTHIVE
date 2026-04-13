import jwt from 'jsonwebtoken';
import { readDatabase } from './database';

const FALLBACK_SECRET = 'studenthive-development-secret';
const TOKEN_TTL = '7d';

function jwtSecret() {
  return process.env.JWT_SECRET || FALLBACK_SECRET;
}

export function createSessionToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    jwtSecret(),
    {
      expiresIn: TOKEN_TTL,
    }
  );
}

function verifySessionToken(token) {
  try {
    return jwt.verify(token, jwtSecret());
  } catch {
    return null;
  }
}

function extractBearerToken(request) {
  const authHeader = request.headers.get('authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (!scheme || !token) {
    return null;
  }

  if (scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  return token.trim();
}

export async function requireAuthenticatedUser(request) {
  const token = extractBearerToken(request);

  if (!token) {
    return {
      ok: false,
      status: 401,
      error: 'Missing Authorization token',
    };
  }

  const payload = verifySessionToken(token);

  if (!payload?.sub) {
    return {
      ok: false,
      status: 401,
      error: 'Invalid or expired session token',
    };
  }

  const db = await readDatabase();
  const user = db.users.find((entry) => entry.id === payload.sub);

  if (!user) {
    return {
      ok: false,
      status: 401,
      error: 'Session user no longer exists',
    };
  }

  return {
    ok: true,
    user,
  };
}
