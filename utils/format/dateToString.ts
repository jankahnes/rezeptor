export default function dateToString(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth is 0-based
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
