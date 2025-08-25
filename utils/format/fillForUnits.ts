type Unit = 'G' | 'KG' | 'OZ' | 'LB' | 'ML' | 'L' | 'TSP' | 'TBSP' | 'CUP' | 'UNITS' | 'FREE';

interface Ingredient {
  amountInfo?: [string | number, Unit][];
  density?: number;
  unit_weight?: number;
  possibleUnits: Unit[];
  name?: string;
}

type AmountInfo = [number, Unit];

// Conversion factors to grams (for weight units) or to ml (for volume units)
const WEIGHT_TO_GRAMS: Record<string, number> = {
  G: 1,
  KG: 1000,
  OZ: 28.3495,
  LB: 453.592
};

const VOLUME_TO_ML: Record<string, number> = {
  ML: 1,
  L: 1000,
  TSP: 5,
  TBSP: 15,
  CUP: 236.588
};

// Priority order for unit display (higher index = higher priority)
const UNIT_PRIORITY: Record<Unit, number> = {
  'KG': 0,
  'L': 0,
  'OZ': 2,
  'LB': 2,
  'TSP': 4,
  'TBSP': 4,
  'CUP': 4,
  'ML': 4,
  'FREE': 9,
  'UNITS': 9,
  'G': 10,
};

export default function fillForUnits(ingredient: Ingredient): void {
  const base = ingredient.amountInfo?.[0];
  if (!base || !ingredient.amountInfo || ingredient.amountInfo.length > 1) return; // only fill if not already filled

  const [amountStr, originalUnit] = base;
  const amount = Number(amountStr);
  const conversions = new Map<Unit, number>(); // Use Map to avoid duplicates
  const { density = 1, unit_weight, possibleUnits } = ingredient;

  // Helper to add conversions to our map
  const addConversion = (val: number, u: Unit): void => {
    if (possibleUnits.includes(u) && !conversions.has(u)) {
      conversions.set(u, Number(val.toFixed(2)));
    }
  };

  // Convert grams to other weight units
  const addWeightConversions = (grams: number): void => {
    Object.entries(WEIGHT_TO_GRAMS).forEach(([weightUnit, factor]) => {
      addConversion(grams / factor, weightUnit as Unit);
    });
  };

  // Convert ml to other volume units
  const addVolumeConversions = (ml: number): void => {
    Object.entries(VOLUME_TO_ML).forEach(([volumeUnit, factor]) => {
      addConversion(ml / factor, volumeUnit as Unit);
    });
  };

  // Convert grams to volume units using density
  const addVolumeFromWeight = (grams: number): void => {
    if (density) {
      const ml = grams / density;
      addVolumeConversions(ml);
    }
  };

  // Convert ml to weight units using density  
  const addWeightFromVolume = (ml: number): void => {
    const grams = ml * density;
    addWeightConversions(grams);
  };

  // Add units conversions from weight
  const addUnitsFromWeight = (grams: number): void => {
    if (unit_weight) {
      addConversion(grams / unit_weight, 'UNITS');
    }
  };

  // Add weight conversions from units
  const addWeightFromUnits = (units: number): void => {
    if (unit_weight) {
      const grams = units * unit_weight;
      addWeightConversions(grams);
      addVolumeFromWeight(grams);
    }
  };

  // Main conversion logic - populate all possible conversions
  if (WEIGHT_TO_GRAMS[originalUnit]) {
    // Weight unit input
    const grams = amount * WEIGHT_TO_GRAMS[originalUnit];
    addWeightConversions(grams);
    addVolumeFromWeight(grams);
    addUnitsFromWeight(grams);
  } else if (VOLUME_TO_ML[originalUnit]) {
    // Volume unit input
    const ml = amount * VOLUME_TO_ML[originalUnit];
    addVolumeConversions(ml);
    addWeightFromVolume(ml);
    
    // Convert to units via weight
    if (density && unit_weight) {
      const grams = ml * density;
      addConversion(grams / unit_weight, 'UNITS');
    }
  } else if (originalUnit === 'UNITS') {
    if (!unit_weight) {
      throw new Error('Unit weight not found for ingredient: ' + ingredient.name);
    }
    addConversion(amount, 'UNITS');
    addWeightFromUnits(amount);
  } else if (originalUnit === 'FREE') {
    addConversion(0, 'FREE');
  }

  // Convert map to prioritized array
  // 1. Original unit comes first (always)
  // 2. Grams comes second (if different from original and available)
  // 3. Rest sorted by priority
  const prioritizedUnits: AmountInfo[] = [];
  
  // 1. Add original unit first
  if (conversions.has(originalUnit)) {
    prioritizedUnits.push([conversions.get(originalUnit)!, originalUnit]);
    conversions.delete(originalUnit); // Remove to avoid duplicates
  }
  
  const remainingUnits = Array.from(conversions.entries())
    .sort(([unitA], [unitB]) => {
      const priorityA = UNIT_PRIORITY[unitA] ?? -1;
      const priorityB = UNIT_PRIORITY[unitB] ?? -1;
      return priorityB - priorityA; // Descending order (highest priority first)
    });
  
  remainingUnits.forEach(([unit, value]) => {
    prioritizedUnits.push([value, unit]);
  });

  ingredient.amountInfo = prioritizedUnits;
}
