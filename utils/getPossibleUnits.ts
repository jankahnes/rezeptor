export default function getPossibleUnits(measurements: string[]): string[] {
  const unitMap: { [key: string]: string[] } = {
    weight: ['G'],
    volume: ['ML'],
    pieces: ['PCS'],
  };

  const result: string[] = [];

  for (const m of measurements) {
    if (m === 'volume') {
      if (!result.includes('ML')) result.push('ML');
    } else if (unitMap[m]) {
      for (const u of unitMap[m]) {
        if (!result.includes(u)) result.push(u);
      }
    }
  }

  // Append tsp and tbsp only if volume is in measurements
  if (measurements.includes('volume')) {
    if (!result.includes('TSP')) result.push('TSP');
    if (!result.includes('TBSP')) result.push('TBSP');
  }

  return result;
}
