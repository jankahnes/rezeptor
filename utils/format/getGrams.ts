export default function convertToGrams(amount, unit, density, unit_weight): number {
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return 0;

  switch (unit) {
    case 'G':
      return num;
    case 'ML':
      return num * density;
    case 'TSP':
      return num * 5 * density;
    case 'TBSP':
      return num * 15 * density;
    case 'UNITS':
      return num * unit_weight;
    default:
      return 0;
  }
}
