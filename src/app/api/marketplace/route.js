import { NextResponse } from 'next/server';
const listings = [];
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let filtered = [...listings];
  const cat = searchParams.get('category'), q = searchParams.get('search');
  if (cat && cat !== 'all') filtered = filtered.filter(l => l.category === cat);
  if (q) filtered = filtered.filter(l => l.title.toLowerCase().includes(q.toLowerCase()));
  return NextResponse.json({ listings: filtered });
}
export async function POST(request) {
  const { title, description, category, price, condition } = await request.json();
  if (!title || !description || !category) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const listing = { id: crypto.randomUUID(), title, description, category, price: Number(price), condition, status: 'active', createdAt: new Date().toISOString() };
  listings.push(listing);
  return NextResponse.json({ success: true, listing }, { status: 201 });
}
