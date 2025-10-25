import isCountable from './isCountable';

type Unit =
  | 'G'
  | 'KG'
  | 'OZ'
  | 'LB'
  | 'ML'
  | 'L'
  | 'TSP'
  | 'TBSP'
  | 'CUP'
  | 'FREE';
type AmountInfo = [number, Unit];

const excludeList = ['OZ', 'LB', 'L', 'KG', 'CUP'];

// Conversion factors to grams (for weight units) or to ml (for volume units)
const WEIGHT_TO_GRAMS: Record<string, number> = {
  G: 1,
  KG: 1000,
  OZ: 28.3495,
  LB: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ML: 1,
  L: 1000,
  TSP: 5,
  TBSP: 15,
  CUP: 236.588,
};

// Priority order for unit display (higher index = higher priority)
const UNIT_PRIORITY: Record<Unit, number> = {
  KG: 0,
  L: 0,
  OZ: 2,
  LB: 2,
  TSP: 4,
  TBSP: 4,
  CUP: 4,
  ML: 4,
  FREE: 9,
  G: 10,
};

const zeroThreshold = 0.05;

export default function fillForUnits(ingredient: Ingredient): void {
  const base = ingredient.amountInfo?.[0];
  if (!base || !ingredient.amountInfo || ingredient.amountInfo.length > 1)
    return; // only fill if not already filled

  const [amountStr, originalUnit] = base as [number, Unit];
  const amount = Number(amountStr);
  const conversions = new Map<Unit, number>(); // Use Map to avoid duplicates. initialize with base
  conversions.set(originalUnit, amount);
  const { density = 1, countable_units } = ingredient;
  const unit_weight = countable_units?.[originalUnit];

  // Helper to add conversions to our map
  const addConversion = (val: number, u: Unit): void => {
    if (excludeList.includes(u) || val < zeroThreshold) return;
    if (!conversions.has(u)) {
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
  const addVolumeFromWeight = (): void => {
    const grams = conversions.get('G')!;
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

  // Add weight conversions from units
  const addWeightFromUnits = (units: number): void => {
    if (unit_weight) {
      const grams = units * unit_weight;
      addWeightConversions(grams);
      addVolumeFromWeight();
    }
  };

  const addCountableUnitsFromWeight = (): void => {
    const grams = conversions.get('G')!;
    if (countable_units && grams) {
      Object.entries(countable_units).forEach(
        ([unit, weight]: [string, number]) => {
          addConversion(grams / weight, unit as Unit);
        }
      );
    }
  };

  // Main conversion logic - populate all possible conversions
  if (WEIGHT_TO_GRAMS[originalUnit]) {
    // Weight unit input
    const grams = amount * WEIGHT_TO_GRAMS[originalUnit];
    addWeightConversions(grams);
    addVolumeFromWeight();
    addCountableUnitsFromWeight();
  } else if (VOLUME_TO_ML[originalUnit]) {
    // Volume unit input
    const ml = amount * VOLUME_TO_ML[originalUnit];
    addVolumeConversions(ml);
    addWeightFromVolume(ml);
    addCountableUnitsFromWeight();
  } else if (isCountable(originalUnit)) {
    if (!countable_units || countable_units[originalUnit] === undefined || countable_units[originalUnit] === null) {
      console.error(
        'Countable unit ' +
          originalUnit +
          ' not found for ingredient: ' +
          ingredient.name
      );
    } else {
      addWeightFromUnits(amount);
      addVolumeFromWeight();
      addCountableUnitsFromWeight();
    }
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

  const remainingUnits = Array.from(conversions.entries()).sort(
    ([unitA], [unitB]) => {
      const priorityA = UNIT_PRIORITY[unitA] ?? -1;
      const priorityB = UNIT_PRIORITY[unitB] ?? -1;
      return priorityB - priorityA; // Descending order (highest priority first)
    }
  );

  remainingUnits.forEach(([unit, value]) => {
    prioritizedUnits.push([value, unit]);
  });

  ingredient.amountInfo = prioritizedUnits;
}
