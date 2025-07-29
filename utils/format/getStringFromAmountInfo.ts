export function getStringFromAmountInfo(
  amountInfo: [number, string], // [amount, unit]
  servingSize: number,
  pieceName: string
): string {
  const [amount, unit] = amountInfo;
  const totalAmount = amount * servingSize;

  if (unit === 'G' || unit === 'ML') {
    return `${Math.round(totalAmount)}${unit.toLowerCase()}`;
  }

  if (unit === 'TSP' || unit === 'TBSP' || unit === 'UNITS') {
    const errorTolerancePercent = 0.1; // 10% probably acceptable error for cooking context (within personal measurement error anyway)
    const errorTolerance = totalAmount * errorTolerancePercent;
    
    const wholeNumber = Math.floor(totalAmount);
    const remainder = totalAmount - wholeNumber;

    const possibleFractions = [
      {value: 1, display: ''},
      {value: 1/2, display: '1/2'},
      {value: 1/4, display: '1/4'},
      {value: 3/4, display: '3/4'},
      {value: 1/3, display: '1/3'},
      {value: 2/3, display: '2/3'}
    ]

    if(wholeNumber === 0) {
      possibleFractions.push({value: 1/6, display: '1/6'})
      possibleFractions.push({value: 1/8, display: '1/8'})
      possibleFractions.push({value: 1/12, display: '1/12'})
      possibleFractions.push({value: 1/16, display: '1/16'})
      possibleFractions.push({value: 1/24, display: '1/24'})
      possibleFractions.push({value: 1/32, display: '1/32'})
    }
    else {
      possibleFractions.unshift({value: 0, display: ''})
    }

    let bestFraction = possibleFractions[0]

    for (const fraction of possibleFractions) {
      const error = Math.abs(remainder - fraction.value);
      if (error < errorTolerance) {
        bestFraction = fraction;
        break;
      }
    }

    let unitName = unit.toLowerCase();
    if (unit === 'UNITS') {
      if (pieceName === 'self') {
        unitName = '';
      } else if (!pieceName.endsWith('s') && totalAmount > 1) {
        unitName = pieceName + 's';
      } else {
        unitName = pieceName;
      }
    }

    const wholeNumberDisplay = wholeNumber === 0 ? '' : wholeNumber

    if(bestFraction.value === 0) {
      return `${wholeNumberDisplay} ${unitName}`;
    } else if (bestFraction.value === 1) {
      return `${wholeNumber + 1} ${unitName}`;
    } else {
      return `${wholeNumberDisplay} ${bestFraction.display} ${unitName}`;
    }
  }

  return `${Math.round(totalAmount)} ${unit.toLowerCase()}`;
}
