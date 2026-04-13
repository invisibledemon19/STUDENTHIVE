import { NextResponse } from 'next/server';
import { readDatabase } from '@/lib/server/database';
import { serverError } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const search = (url.searchParams.get('search') || '').trim().toLowerCase();
    const status = url.searchParams.get('status');

    const db = await readDatabase();
    let resources = [...db.resources];

    if (type && type !== 'all') {
      resources = resources.filter((entry) => entry.type === type);
    }

    if (status && status !== 'all') {
      resources = resources.filter((entry) => entry.status === status);
    }

    if (search) {
      resources = resources.filter(
        (entry) =>
          entry.name.toLowerCase().includes(search) ||
          entry.building.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, resources });
  } catch (error) {
    console.error('resources GET failure', error);
    return serverError('Unable to fetch resources right now');
  }
}
