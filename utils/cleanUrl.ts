export default function cleanUrl(url: string | null | undefined) {
  if (!url) return null;
  return url.split('?')[0].replace(/\/+$/, '');
}
