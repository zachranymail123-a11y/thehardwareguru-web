import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Cron is working!', 
    time: new Date().toISOString() 
  });
}
