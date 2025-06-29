export default function capitalize(str: string | undefined | null): string {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  return '';
}
