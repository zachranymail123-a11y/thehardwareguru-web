export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response(JSON.stringify({ message: "KONECNE TO ŽIJE" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
