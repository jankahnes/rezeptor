export default function getPossibleUnits(measurements: string[]): string[] {
  const result: string[] = [];
  if (measurements.includes('units')) {
    result.push('UNITS');
  }
  if (measurements.includes('weight')) {
    result.push('G');
  }
  if (measurements.includes('volume')) {
    result.push('ML');
    result.push('TSP');
    result.push('TBSP');
  }

  return result;
}
