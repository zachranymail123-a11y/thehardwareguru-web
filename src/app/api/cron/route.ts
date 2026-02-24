import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    status: 'Funguje to!', 
    message: 'Cesta /api/cron je správně nastavená.',
    time: new Date().toISOString() 
  });
}
