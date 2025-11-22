export default async function getThumbnailUrl(
  url: string | null | undefined
): Promise<string | null> {
  if (!url) return null;
  try {
    const ytMatch = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );

    if (ytMatch) {
      const videoId = ytMatch[1];
      //return `https://img.youtube.com/vi_webp/${videoId}/2.webp`
      return `https://img.youtube.com/vi_webp/${videoId}/hqdefault.webp`;
    }

    if (/tiktok\.com/.test(url)) {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
        url
      )}`;
      const res = await fetch(oembedUrl);
      if (!res.ok) throw new Error('Failed to fetch TikTok oEmbed');
      const data = await res.json();
      return data.thumbnail_url ?? null;
    }

    if (/instagram\.com/.test(url)) {
      if (process.server) return null; //skip during SSR

      const res = await fetch(
        `/api/get-instagram-thumbnail?url=${encodeURIComponent(url)}`
      );
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (err) {
    console.error('getThumbnailUrl error:', err);
    return null;
  }
}
