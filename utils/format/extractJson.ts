export default function (text: string) {
  const match = text.match(/{[^{}]*}/);
  if (match && match[0]) {
    return match[0].trim();
  }
  return text.trim();
}
