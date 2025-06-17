export function getStringFromAmountInfo(
  amountInfo: [number, string],
  servingSize: number,
  pieceName: string
): string {
  const [amount, unit] = amountInfo;
  const totalAmount = amount * servingSize;

  const smallestTolerableError = 0.1;

  const fractions = [1, 1 / 2, 1 / 3, 1 / 4];

  if (unit === 'G' || unit === 'ML') {
    return `${Math.round(totalAmount)}${unit.toLowerCase()}`;
  }

  if (unit === 'TSP' || unit === 'TBSP' || unit === 'UNITS') {
    let bestNumerator = 0;
    let bestDenominator = 1;
    let minError = Infinity;

    for (const fraction of fractions) {
      const multiple = Math.round(totalAmount / fraction);
      const approx = multiple * fraction;
      const error = Math.abs(approx - totalAmount);

      if (error < smallestTolerableError) {
        bestNumerator = multiple;
        bestDenominator = 1 / fraction;
        break;
      }

      if (error < minError) {
        minError = error;
        bestNumerator = multiple;
        bestDenominator = 1 / fraction;
      }
    }
    let unitName = unit.toLowerCase();
    if (unit == 'UNITS') {
      unitName = '';
      if (!pieceName.endsWith('s') && totalAmount > 1 && pieceName != 'self') {
        unitName = pieceName + 's';
      } else if (pieceName != 'self') {
        unitName = pieceName;
      }
    }
    if (bestDenominator === 1) {
      return `${bestNumerator} ${unitName}`;
    } else {
      return `${bestNumerator}/${bestDenominator} ${unitName}`;
    }
  }
}
