export default async (request, context) => {
  const url = new URL(request.url);
  const provincia = url.searchParams.get("provincia") || "VB";

  // Detect local development
  // In Netlify Dev, context.geo is usually empty and x-nf-edge header is missing
  const isLocal = !request.headers.get("x-nf-edge") && (!context.geo || !context.geo.city);

  // Construct internal URL for the serverless function
  const functionUrl = `${url.protocol}//${url.host}/.netlify/functions/carburanti?provincia=${provincia}`;

  if (isLocal) {
    console.log(`[Edge Function] Local dev detected, proxying to ${functionUrl}`);
    return fetch(functionUrl);
  }

  // Calculate TTL until 10:00 UTC
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(10, 0, 0, 0);

  if (now >= target) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  const ttlSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

  console.log(`[Edge Function] Fetching from serverless: ${functionUrl} with TTL: ${ttlSeconds}s`);

  try {
    const response = await fetch(functionUrl);

    // We create a new response to be able to modify headers
    // and ensure it's compatible with Netlify's CDN caching requirements
    const newResponse = new Response(response.body, response);

    newResponse.headers.set("Netlify-CDN-Cache-Control", `s-maxage=${ttlSeconds}`);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Content-Type", "application/json");

    // Ensure the browser doesn't cache it, only the CDN
    newResponse.headers.set("Cache-Control", "public, max-age=0, must-revalidate");

    return newResponse;
  } catch (error) {
    console.error(`[Edge Function] Error fetching from serverless: ${error.message}`);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
};
