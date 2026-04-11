import { NextResponse } from 'next/server';
const bookings = [];
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let filtered = [...bookings];
  const rid = searchParams.get('resourceId'), date = searchParams.get('date');
  if (rid) filtered = filtered.filter(b => b.resourceId === Number(rid));
  if (date) filtered = filtered.filter(b => b.date === date);
  return NextResponse.json({ bookings: filtered });
}
export async function POST(request) {
  const { resourceId, date, startTime, endTime, purpose } = await request.json();
  if (!resourceId || !date || !startTime || !endTime || !purpose) return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  const conflict = bookings.some(b => b.resourceId === resourceId && b.date === date && b.status !== 'cancelled' && startTime < b.endTime && endTime > b.startTime);
  if (conflict) return NextResponse.json({ error: 'Booking conflict!' }, { status: 409 });
  const booking = { id: crypto.randomUUID(), resourceId, date, startTime, endTime, purpose, status: 'pending', createdAt: new Date().toISOString() };
  bookings.push(booking);
  return NextResponse.json({ success: true, booking }, { status: 201 });
}
