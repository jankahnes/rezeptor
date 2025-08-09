export default function convertToGrams(amount, unit, density, unit_weight): number {
  const num = Number(amount);
  if(!density) {
    density = 1;
  }
  if (isNaN(num) || num <= 0) return 0;

  switch (unit) {
    case 'G':
      return num;
    case 'KG':
      return num * 1000;
    case 'OZ':
      return num * 28.3495;
    case 'LB':
      return num * 453.592;

    case 'ML':
      return num * density;
    case 'L':
      return num * 1000 * density;
    case 'TSP':
      return num * 5 * density;
    case 'TBSP':
      return num * 15 * density;
    case 'CUP':
      return num * 236.588 * density;

    case 'UNITS':
      return num * unit_weight;
    case 'FREE':
    default:
      return 0;
  }
}
