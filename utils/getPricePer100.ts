export default function (
  food: { density?: number; unit_weight?: number },
  price: number,
  amount: number,
  unit: string
) {
  if (unit === 'g') {
    return price * (100 / amount);
  }
  if (unit === 'kg') {
    return price * (100 / (amount * 1000));
  }
  if (unit === 'ml') {
    if (!food.density)
      throw new Error('Density required for ml to g conversion');
    return price * (100 / (amount * food.density));
  }
  if (unit === 'l') {
    if (!food.density)
      throw new Error('Density required for l to g conversion');
    return price * (100 / (amount * 1000 * food.density));
  }
  if (unit === 'pcs') {
    if (!food.unit_weight)
      throw new Error('Piece weight required for pcs unit');
    return price * (100 / (amount * food.unit_weight));
  }
  throw new Error('Unknown unit');
}
