import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import {
  badRequest,
  parseJsonBody,
  serverError,
  unauthorized,
} from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof rawTags === 'string') {
    return rawTags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function findMatchCount(collection, item) {
  const counterType = item.type === 'lost' ? 'found' : 'lost';
  const terms = item.title.toLowerCase().split(/\s+/).filter(Boolean);

  return collection.filter((entry) => {
    if (entry.type !== counterType || entry.status !== 'active') {
      return false;
    }

    const candidate = `${entry.title} ${entry.description}`.toLowerCase();
    return terms.some((term) => candidate.includes(term));
  }).length;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const status = url.searchParams.get('status');

    const db = await readDatabase();
    let items = [...db.lostFoundItems];

    if (type && type !== 'all') {
      items = items.filter((entry) => entry.type === type);
    }

    if (status && status !== 'all') {
      items = items.filter((entry) => entry.status === status);
    }

    if (search) {
      items = items.filter(
        (entry) =>
          entry.title.toLowerCase().includes(search) ||
          entry.description.toLowerCase().includes(search) ||
          entry.location.toLowerCase().includes(search) ||
          entry.tags.some((tag) => tag.includes(search))
      );
    }

    items.sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error('lost-found GET failure', error);
    return serverError('Unable to fetch lost and found reports right now');
  }
}

export async function POST(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return unauthorized(auth.error);
  }

  const body = await parseJsonBody(request);

  if (!body) {
    return badRequest('Invalid JSON body');
  }

  const type = String(body.type || '').trim().toLowerCase();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const location = String(body.location || '').trim();
  const tags = normalizeTags(body.tags);
  const image = body.image || null;

  if (!['lost', 'found'].includes(type)) {
    return badRequest('type must be either "lost" or "found"');
  }

  if (!title || !description || !location) {
    return badRequest('title, description, and location are required');
  }

  try {
    let createdItem = null;
    let matchesCount = 0;

    await updateDatabase((db) => {
      createdItem = {
        id: crypto.randomUUID(),
        reporterId: auth.user.id,
        reporterName: auth.user.name,
        type,
        title,
        description,
        location,
        tags,
        image,
        status: 'active',
        dateReported: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };

      matchesCount = findMatchCount(db.lostFoundItems, createdItem);
      db.lostFoundItems.unshift(createdItem);
      return db;
    });

    return NextResponse.json(
      {
        success: true,
        item: createdItem,
        matches: matchesCount > 0 ? { count: matchesCount } : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('lost-found POST failure', error);
    return serverError('Unable to create report right now');
  }
}

export async function PATCH(request) {
  const auth = await requireAuthenticatedUser(request);

  if (!auth.ok) {
    return unauthorized(auth.error);
  }

  const body = await parseJsonBody(request);

  if (!body) {
    return badRequest('Invalid JSON body');
  }

  const itemId = String(body.id || '').trim();
  const status = String(body.status || '').trim().toLowerCase();
  const allowed = new Set(['active', 'matched', 'recovered']);

  if (!itemId || !allowed.has(status)) {
    return badRequest('id and a valid status are required');
  }

  try {
    let updatedItem = null;
    let missing = false;

    await updateDatabase((db) => {
      const item = db.lostFoundItems.find((entry) => entry.id === itemId);

      if (!item) {
        missing = true;
        return db;
      }

      item.status = status;
      item.updatedAt = new Date().toISOString();

      if (status === 'recovered') {
        item.claimedBy = auth.user.id;
      }

      updatedItem = item;
      return db;
    });

    if (missing) {
      return badRequest('Item not found');
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    });
  } catch (error) {
    console.error('lost-found PATCH failure', error);
    return serverError('Unable to update report right now');
  }
}
