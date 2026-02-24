import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(process.cwd(), 'backend/automat.js');

    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Chyba automatu: ${error.message}`);
        return resolve(NextResponse.json({ error: error.message }, { status: 500 }));
      }
      console.log(`Stdout: ${stdout}`);
      resolve(NextResponse.json({ message: 'Autopilot zamakal!', output: stdout }));
    });
  });
}
