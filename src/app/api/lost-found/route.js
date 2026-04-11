import { NextResponse } from 'next/server';
const items = [];
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let filtered = [...items];
  const type = searchParams.get('type'), q = searchParams.get('search');
  if (type && type !== 'all') filtered = filtered.filter(i => i.type === type);
  if (q) filtered = filtered.filter(i => i.title.toLowerCase().includes(q.toLowerCase()) || i.tags?.some(t => t.includes(q.toLowerCase())));
  return NextResponse.json({ items: filtered });
}
export async function POST(request) {
  const { type, title, description, location, tags } = await request.json();
  if (!type || !title || !description || !location) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const item = { id: crypto.randomUUID(), type, title, description, location, tags: tags || [], status: 'active', dateReported: new Date().toISOString().split('T')[0] };
  const matchType = type === 'lost' ? 'found' : 'lost';
  const matches = items.filter(i => i.type === matchType && i.status === 'active' && i.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]));
  items.push(item);
  return NextResponse.json({ success: true, item, matches: matches.length > 0 ? { count: matches.length } : null }, { status: 201 });
}
