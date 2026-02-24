import { NextResponse } from 'next/server'; export async function GET() { return NextResponse.json({ status: 'Funguje to!', time: new Date().toISOString() }); }
