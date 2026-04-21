export default async (request, context) => {
  const url = new URL(request.url);

  // Detect local development
  // In Netlify Dev, context.geo is usually empty and x-nf-edge header is missing
  const isLocal = !request.headers.get("x-nf-edge") && (!context.geo || !context.geo.city);

  // Default to VB if provincia is missing, and preserve all other query parameters
  if (!url.searchParams.has("provincia")) {
    url.searchParams.set("provincia", "VB");
  }

  // Construct internal URL for the serverless function using URL object
  const functionUrl = new URL(`/.netlify/functions/carburanti${url.search}`, url.origin);

  if (isLocal) {
    console.log(`[Edge Function] Local dev detected, proxying to ${functionUrl.toString()}`);
    return fetch(functionUrl.toString());
  }

  // Calculate TTL until 08:00 UTC
  const now = new Date();
  const target = new Date(now);
  target.setUTCHours(8, 0, 0, 0);

  if (now >= target) {
    target.setUTCDate(target.getUTCDate() + 1);
  }

  const ttlSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);

  console.log(`[Edge Function] Fetching from serverless: ${functionUrl.toString()} with TTL: ${ttlSeconds}s`);

  try {
    const response = await fetch(functionUrl.toString());

    // We create a new response to be able to modify headers
    const newResponse = new Response(response.body, response);

    // Set standard headers
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Content-Type", "application/json");

    // ONLY CACHE IF SUCCESSFUL (200-299)
    if (response.ok) {
      newResponse.headers.set("Netlify-CDN-Cache-Control", `s-maxage=${ttlSeconds}`);
      // Ensure the browser doesn't cache it, only the CDN
      newResponse.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    } else {
      // Don't cache errors at the CDN level
      newResponse.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    }

    return newResponse;
  } catch (error) {
    console.error(`[Edge Function] Error fetching from serverless: ${error.message}`);
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  }
};
