import { NextResponse } from 'next/server';
import { requireAuthenticatedUser } from '@/lib/server/auth';
import { readDatabase, updateDatabase } from '@/lib/server/database';
import {
  badRequest,
  conflict,
  isValidDate,
  isValidTime,
  parseJsonBody,
  serverError,
  toMinutes,
  unauthorized,
} from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const resourceId = Number(url.searchParams.get('resourceId'));
    const date = url.searchParams.get('date');
    const mine = url.searchParams.get('mine') === 'true';

    let currentUserId = null;

    if (mine) {
      const auth = await requireAuthenticatedUser(request);
      if (!auth.ok) {
        return unauthorized(auth.error);
      }
      currentUserId = auth.user.id;
    }

    const db = await readDatabase();
    let bookings = [...db.bookings];

    if (!Number.isNaN(resourceId) && resourceId > 0) {
      bookings = bookings.filter((entry) => entry.resourceId === resourceId);
    }

    if (date) {
      bookings = bookings.filter((entry) => entry.date === date);
    }

    if (currentUserId) {
      bookings = bookings.filter((entry) => entry.userId === currentUserId);
    }

    bookings.sort((left, right) => {
      if (left.date === right.date) {
        return left.startTime.localeCompare(right.startTime);
      }
      return left.date.localeCompare(right.date);
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error('bookings GET failure', error);
    return serverError('Unable to fetch bookings right now');
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

  const resourceId = Number(body.resourceId);
  const date = String(body.date || '').trim();
  const startTime = String(body.startTime || '').trim();
  const endTime = String(body.endTime || '').trim();
  const purpose = String(body.purpose || '').trim();

  if (!resourceId || !date || !startTime || !endTime || !purpose) {
    return badRequest('resourceId, date, startTime, endTime and purpose are required');
  }

  if (!isValidDate(date)) {
    return badRequest('date must be in YYYY-MM-DD format');
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return badRequest('startTime and endTime must be in HH:mm format');
  }

  if (toMinutes(startTime) >= toMinutes(endTime)) {
    return badRequest('endTime must be after startTime');
  }

  try {
    let createdBooking = null;
    let conflictDetected = false;
    let resourceMissing = false;

    await updateDatabase((db) => {
      const resource = db.resources.find((entry) => entry.id === resourceId);

      if (!resource || resource.status !== 'active') {
        resourceMissing = true;
        return db;
      }

      conflictDetected = db.bookings.some(
        (entry) =>
          entry.resourceId === resourceId &&
          entry.date === date &&
          !['cancelled', 'rejected'].includes(entry.status) &&
          toMinutes(startTime) < toMinutes(entry.endTime) &&
          toMinutes(endTime) > toMinutes(entry.startTime)
      );

      if (conflictDetected) {
        return db;
      }

      createdBooking = {
        id: crypto.randomUUID(),
        userId: auth.user.id,
        userName: auth.user.name,
        userEmail: auth.user.email,
        resourceId,
        date,
        startTime,
        endTime,
        purpose,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      db.bookings.push(createdBooking);
      return db;
    });

    if (resourceMissing) {
      return badRequest('Selected resource is invalid or inactive');
    }

    if (conflictDetected) {
      return conflict('Booking conflict detected for this time range');
    }

    return NextResponse.json(
      {
        success: true,
        booking: createdBooking,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('bookings POST failure', error);
    return serverError('Unable to create booking right now');
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

  const bookingId = String(body.id || '').trim();
  const nextStatus = String(body.status || '').trim().toLowerCase();
  const allowed = new Set(['cancelled']);

  if (!bookingId || !allowed.has(nextStatus)) {
    return badRequest('Only booking cancellation is supported');
  }

  try {
    let updatedBooking = null;
    let missing = false;
    let notOwner = false;

    await updateDatabase((db) => {
      const booking = db.bookings.find((entry) => entry.id === bookingId);

      if (!booking) {
        missing = true;
        return db;
      }

      if (booking.userId !== auth.user.id) {
        notOwner = true;
        return db;
      }

      booking.status = nextStatus;
      booking.updatedAt = new Date().toISOString();
      updatedBooking = booking;
      return db;
    });

    if (missing) {
      return badRequest('Booking not found');
    }

    if (notOwner) {
      return unauthorized('You can only cancel your own bookings');
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('bookings PATCH failure', error);
    return serverError('Unable to update booking right now');
  }
}
