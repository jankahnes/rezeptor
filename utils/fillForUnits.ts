export default function fillForUnits(ingredient) {
  const base = ingredient.amountInfo?.[0];
  if (!base || ingredient.amountInfo.length > 1) return; // only fill if not already filled

  const [amountStr, unit] = base;
  const amount = Number(amountStr);
  const out = [];
  const { density, unit_weight, possibleUnits } = ingredient;

  const add = (val, u) => {
    out.push([Number(val.toFixed(2)), u]);
  };

  if (unit === 'G') {
    add(amount, 'G');
    if (unit_weight && possibleUnits.includes('UNITS'))
      add(amount / unit_weight, 'UNITS');
    if (density && possibleUnits.includes('TSP'))
      add(amount / density / 5, 'TSP');
    if (density && possibleUnits.includes('TBSP'))
      add(amount / density / 15, 'TBSP');
  } else if (unit === 'ML') {
    const mass = density ? amount * density : null;
    if (mass != null) {
      add(amount, 'ML');
      if (possibleUnits.includes('TSP')) add(amount / 5, 'TSP');
      if (possibleUnits.includes('TBSP')) add(amount / 15, 'TBSP');
      add(mass, 'G');
    }
  } else if (unit === 'UNITS') {
    if (unit_weight) {
      const g = unit_weight * amount;
      add(amount, 'UNITS');
      add(g, 'G');
    }
  } else if (unit === 'TSP') {
    const ml = amount * 5;
    add(amount, 'TSP');
    if (density) {
      const g = ml * density;
      add(g, 'G');
    }
    add(amount / 3, 'TBSP');
  } else if (unit === 'TBSP') {
    add(amount, 'TBSP');
    const ml = amount * 15;
    if (density) {
      const g = ml * density;
      add(g, 'G');
    }
    add(amount * 3, 'TSP');
  }

  ingredient.amountInfo = out;
}
