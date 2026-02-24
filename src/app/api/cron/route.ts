import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    message: "Cron API is ALIVE!", 
    time: new Date().toISOString() 
  });
}
