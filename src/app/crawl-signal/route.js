export async function GET() {

  const now = new Date().toISOString();

  const body = `
Crawler signal
Updated: ${now}
`;

  return new Response(body,{
    headers:{
      "Content-Type":"text/plain",
      "Cache-Control":"no-cache"
    }
  });

}
