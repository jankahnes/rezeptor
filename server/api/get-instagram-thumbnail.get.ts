export default defineEventHandler(async (event) => {
  const query = getQuery(event).url as string;
  const url = query.replace('reels', 'p').replace('reel', 'p').split("?")[0];

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing `url` query parameter.',
    });
  }

  const mediaUrl = url.endsWith('/')
    ? `${url}media/?size=l`
    : `${url}/media/?size=l`;

  const res = await fetch(mediaUrl, { redirect: 'manual' });
  const location = res.headers.get('location');
  if (!location) {
    throw createError({ statusCode: 500, statusMessage: 'No redirect found' });
  }

  // Fetch the actual image binary
  const imageRes = await fetch(location);

  if (!imageRes.ok) {
    throw createError({
      statusCode: imageRes.status,
      statusMessage: 'Failed to fetch image',
    });
  }

  // Stream the image back to the client
  const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await imageRes.arrayBuffer();
  return new Response(arrayBuffer, {
    headers: { 'content-type': contentType },
  });
});
