export default function (text: string) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || start > end) return null;

  return text.slice(start, end + 1).trim();
}
