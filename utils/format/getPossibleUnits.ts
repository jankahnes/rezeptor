export default function getPossibleUnits(measurements: string[]): string[] {
  const result: string[] = [];
  if (measurements.includes('units')) {
    result.push('UNITS');
  }
  if (measurements.includes('weight')) {
    result.push('G');
    result.push('LB');
    result.push('OZ');
    result.push('KG');
  }
  if (measurements.includes('volume')) {
    result.push('ML');
    result.push('TSP');
    result.push('TBSP');
    result.push('CUP');
    result.push("L");
  }
  if (measurements.includes('free')) {
    result.push('FREE');
  }

  return result;
}
