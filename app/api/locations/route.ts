import { NextResponse } from 'next/server';
import locations from '@/lib/india_locations.json';

export async function GET() {
  return NextResponse.json(locations);
}
