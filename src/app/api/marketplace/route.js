import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import {
  badRequest,
  normalizeCondition,
  parseJsonBody,
  serverError,
  unauthorized,
} from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_CATEGORIES = new Set([
  'books',
  'electronics',
  'notes',
  'accessories',
  'sports',
  'clothing',
  'furniture',
  'other',
]);

function withPostedAgo(listing) {
  const now = Date.now();
  const createdAtMs = new Date(listing.createdAt).getTime();
  const diffMs = Math.max(0, now - createdAtMs);
  const minutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let postedAgo = 'Just now';
  if (days > 0) {
    postedAgo = `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    postedAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 1) {
    postedAgo = `${minutes} minutes ago`;
  }

  return {
    ...listing,
    postedAgo,
  };
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const sort = url.searchParams.get('sort') || 'recent';
    const status = url.searchParams.get('status') || 'active';

    const db = await readDatabase();
    let listings = [...db.marketplaceListings];

    if (category && category !== 'all') {
      listings = listings.filter((entry) => entry.category === category);
    }

    if (status !== 'all') {
      listings = listings.filter((entry) => entry.status === status);
    }

    if (search) {
      listings = listings.filter(
        (entry) =>
          entry.title.toLowerCase().includes(search) ||
          entry.description.toLowerCase().includes(search)
      );
    }

    if (sort === 'price-low') {
      listings.sort((left, right) => left.price - right.price);
    } else if (sort === 'price-high') {
      listings.sort((left, right) => right.price - left.price);
    } else if (sort === 'trust') {
      listings.sort(
        (left, right) =>
          (right.sellerTrustScore || 0) - (left.sellerTrustScore || 0)
      );
    } else {
      listings.sort(
        (left, right) =>
          new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    }

    return NextResponse.json({
      success: true,
      listings: listings.map(withPostedAgo),
    });
  } catch (error) {
    console.error('marketplace GET failure', error);
    return serverError('Unable to fetch marketplace listings right now');
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

  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const category = String(body.category || '').trim().toLowerCase();
  const condition = normalizeCondition(body.condition || 'good');
  const price = Number(body.price);

  if (!title || !description || !category) {
    return badRequest('title, description, and category are required');
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return badRequest('Invalid category');
  }

  if (!condition) {
    return badRequest('Invalid condition');
  }

  if (!Number.isFinite(price) || price < 0) {
    return badRequest('price must be a valid positive number');
  }

  try {
    let createdListing = null;

    await updateDatabase((db) => {
      createdListing = {
        id: crypto.randomUUID(),
        sellerId: auth.user.id,
        sellerName: auth.user.name,
        sellerVerified: Boolean(auth.user.verified),
        sellerTrustScore: Number(auth.user.trustScore || 5),
        title,
        description,
        category,
        price,
        condition,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      db.marketplaceListings.unshift(createdListing);
      return db;
    });

    return NextResponse.json(
      {
        success: true,
        listing: withPostedAgo(createdListing),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('marketplace POST failure', error);
    return serverError('Unable to create listing right now');
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

  const listingId = String(body.id || '').trim();
  const status = String(body.status || '').trim().toLowerCase();
  const allowed = new Set(['active', 'sold', 'reserved', 'removed']);

  if (!listingId || !allowed.has(status)) {
    return badRequest('id and a valid status are required');
  }

  try {
    let updatedListing = null;
    let notFound = false;
    let notOwner = false;

    await updateDatabase((db) => {
      const listing = db.marketplaceListings.find(
        (entry) => entry.id === listingId
      );

      if (!listing) {
        notFound = true;
        return db;
      }

      if (listing.sellerId !== auth.user.id) {
        notOwner = true;
        return db;
      }

      listing.status = status;
      listing.updatedAt = new Date().toISOString();
      updatedListing = listing;
      return db;
    });

    if (notFound) {
      return badRequest('Listing not found');
    }

    if (notOwner) {
      return unauthorized('You can only edit your own listings');
    }

    return NextResponse.json({
      success: true,
      listing: withPostedAgo(updatedListing),
    });
  } catch (error) {
    console.error('marketplace PATCH failure', error);
    return serverError('Unable to update listing right now');
  }
}
