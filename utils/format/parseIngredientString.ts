import type { SupabaseClient } from '@supabase/supabase-js';
import type { ParsedPart } from '~/types/types';
import singularizeWord from './singularizeWord';
import pluralizeWord from './pluralizeWord';

export const amountStyling =
  'font-semibold py-1 px-2 rounded-md bg-gray-100 text-gray-600';
export const unitStyling =
  'font-semibold italic text-gray-600 py-1 px-2 rounded-md bg-gray-100';
export const ingredientStyling =
  'font-bold text-gray-800 py-1 px-2 rounded-md bg-gray-200';
export const preparationDescriptionStyling =
  'font-light italic text-gray-600 py-1 px-2 rounded-md bg-gray-50';
export const ignoredStyling =
  'font-normal text-gray-600 py-1 px-2 rounded-md bg-gray-50';

const ignoreWords = ['a', 'an', 'the', 'of'];

const numeric: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
  quarter: 0.25,
  'three-quarters': 0.75,
  '½': 0.5,
  '¼': 0.25,
  '¾': 0.75,
  '⅓': 1 / 3,
  '⅔': 2 / 3,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
  dozen: 12,
};

export const unitToDBMap: Record<string, string> = {
  g: 'G',
  gram: 'G',
  grams: 'G',
  ml: 'ML',
  milliliter: 'ML',
  milliliters: 'ML',
  tsp: 'TSP',
  teaspoon: 'TSP',
  teaspoons: 'TSP',
  tbsp: 'TBSP',
  tablespoon: 'TBSP',
  tablespoons: 'TBSP',
  cup: 'CUP',
  cups: 'CUP',
  oz: 'OZ',
  ounce: 'OZ',
  ounces: 'OZ',
  lb: 'LB',
  lbs: 'LB',
  pound: 'LB',
  pounds: 'LB',
  l: 'L',
  liter: 'L',
  liters: 'L',
  kg: 'KG',
  kilogram: 'KG',
  kilograms: 'KG',
  free: 'FREE',
};

function parseNumeric(word: string): number | null {
  const cleanWord = word.trim();

  // Handle regular numbers
  if (!isNaN(Number(cleanWord)) && cleanWord !== '') {
    return Number(cleanWord);
  }

  // Handle text numbers and fractions (case-insensitive)
  const lowerWord = cleanWord.toLowerCase();
  if (numeric[lowerWord as keyof typeof numeric]) {
    return numeric[lowerWord as keyof typeof numeric];
  }

  // Handle fraction strings like "1/2"
  if (cleanWord.includes('/')) {
    const [numerator, denominator] = cleanWord.split('/');
    const num = Number(numerator);
    const den = Number(denominator);
    if (!isNaN(num) && !isNaN(den) && den !== 0) {
      return num / den;
    }
  }

  return null;
}

function parseNumberUnit(word: string): {
  number: number;
  unit: string;
  originalText: string;
  numberPart: string;
  unitPart: string;
} | null {
  const cleanWord = word.trim();

  // Try to find a number at the beginning of the word
  let numericPart = '';
  let unitPart = '';

  // First try decimal numbers (e.g., "1.5ml", "2.25g")
  const decimalMatch = cleanWord.match(/^(\d+\.?\d*)(.*)/);
  if (decimalMatch) {
    const [, numStr, rest] = decimalMatch;
    const num = Number(numStr);
    if (!isNaN(num)) {
      numericPart = numStr;
      unitPart = rest.trim();
    }
  }

  // If no decimal match, try fraction match (e.g., "1/2tsp")
  if (!numericPart) {
    const fractionMatch = cleanWord.match(/^(\d+\/\d+)(.*)/);
    if (fractionMatch) {
      const [, fracStr, rest] = fractionMatch;
      const [numerator, denominator] = fracStr.split('/');
      const num = Number(numerator) / Number(denominator);
      if (!isNaN(num)) {
        numericPart = fracStr;
        unitPart = rest.trim();
      }
    }
  }

  // If we found a numeric part, check if the remaining part is a valid unit
  if (numericPart && unitPart) {
    const lowerUnit = unitPart.toLowerCase();
    if (unitToDBMap[lowerUnit as keyof typeof unitToDBMap]) {
      let numberValue: number;
      if (numericPart.includes('/')) {
        const [num, den] = numericPart.split('/');
        numberValue = Number(num) / Number(den);
      } else {
        numberValue = Number(numericPart);
      }

      return {
        number: numberValue,
        unit: unitToDBMap[lowerUnit as keyof typeof unitToDBMap],
        originalText: cleanWord,
        numberPart: numericPart,
        unitPart: unitPart,
      };
    }
  }

  return null;
}

export async function parseIngredientString(
  client: SupabaseClient,
  ingredientString: string,
  hasIngredient: boolean = true
) {
  let amount = null;
  let unit = '';
  let ingredient = null;
  let preparationDescription = null;

  const tokens = ingredientString
    .split(' ')
    .filter((word) => word.trim() !== '')
    .map((word) => word.trim());
  const parsed: ParsedPart[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];

    // Skip ignore words (case-insensitive)
    if (ignoreWords.includes(word.toLowerCase())) {
      parsed.push({ text: word, styling: ignoredStyling });
      continue;
    }

    // Try to parse as combined number+unit first (e.g., "100g", "2tbsp")
    const numberUnit = parseNumberUnit(word);
    if (numberUnit) {
      amount = numberUnit.number;
      unit = numberUnit.unit;
      parsed.push({ text: word, styling: amountStyling });
      continue;
    }

    // Try to parse as standalone number
    const numericValue = parseNumeric(word);
    if (numericValue !== null) {
      amount = numericValue;
      parsed.push({ text: word, styling: amountStyling });
      continue;
    }

    // Try to parse as standalone unit (case-insensitive)
    const lowerWord = word.toLowerCase();
    if (unitToDBMap[lowerWord as keyof typeof unitToDBMap]) {
      unit = unitToDBMap[lowerWord as keyof typeof unitToDBMap];
      parsed.push({ text: word, styling: unitStyling });
      continue;
    }

    const remainingWords = tokens.slice(i).join(' ');

    const ingredientRegex = /^(.+?)(?:\s*\(|,\s*)(.+?)(?:\))?$/;
    const match = remainingWords.match(ingredientRegex);

    let searchTerm = '';
    let extra = '';

    if (match) {
      searchTerm = match[1].trim();
      extra = match[2].trim();
    } else {
      searchTerm = remainingWords.trim();
    }

    if (searchTerm && hasIngredient) {
      try {
        const searchWords = searchTerm.split(' ');
        const candidates = [];

        if (searchWords.length > 1) {
          for (let i = 0; i < searchWords.length; i++) {
            candidates.push(searchWords.slice(i).join(' '));
          }
        } else {
          candidates.push(searchTerm);
        }

        let bestResult = null;
        let bestSimilarity = -1;

        let bestCandidateIndex = 0;
        for (let j = 0; j < candidates.length; j++) {
          const candidate = candidates[j];
          const { data, error } = await client.rpc('search_foods', {
            query: candidate,
            max: 1,
          });
          if (data?.[0] && data[0].best_similarity > bestSimilarity) {
            bestResult = data[0];
            bestSimilarity = data[0].best_similarity;
            bestCandidateIndex = j;
            if (j == 0 && bestSimilarity > 0.8) {
              break;
            }
          }
        }

        if (bestResult) {
          if (bestCandidateIndex > 0) {
            const excludedWords = searchWords
              .slice(0, bestCandidateIndex)
              .join(' ');
            const excludedParsed = await parseIngredientString(
              client,
              excludedWords,
              false
            );
            parsed.push(...excludedParsed.parsed);
          }
          ingredient = bestResult;

          // Check if any previously ignored words match countable_units
          if (unit === '' && ingredient.food.countable_units) {
            const countableUnits = ingredient.food.countable_units as Record<
              string,
              number
            >;
            // Get all previously parsed words with ignoredStyling
            const previouslyIgnoredWords = parsed
              .filter((p) => p.styling === ignoredStyling)
              .map((p) => p.text);
            for (const ignoredWord of previouslyIgnoredWords) {
              const lowerIgnored = ignoredWord.toLowerCase();
              let matchedUnit: string | null = null;

              // Check exact match
              if (countableUnits[lowerIgnored]) {
                matchedUnit = lowerIgnored;
              }
              // Check singular version
              else if (countableUnits[singularizeWord(lowerIgnored)]) {
                matchedUnit = singularizeWord(lowerIgnored);
              }
              // Check plural version
              else if (countableUnits[pluralizeWord(lowerIgnored)]) {
                matchedUnit = pluralizeWord(lowerIgnored);
              }

              if (matchedUnit) {
                unit = matchedUnit;
                // Update styling for this word in parsed
                const parsedEntry = parsed.find(
                  (p) => p.text.toLowerCase() === lowerIgnored
                );
                if (parsedEntry) {
                  parsedEntry.styling = unitStyling;
                }
                break;
              }
            }
          }

          if (
            unit == '' &&
            amount &&
            amount > 1 &&
            !parsed.some((p) => p.text.toLowerCase() == 'of')
          ) {
            ingredient.name = pluralizeWord(ingredient.name);
          }

          parsed.push({ text: ingredient.name, styling: ingredientStyling });
          if (extra) {
            extra = extra.replace(/^,/, '');
            preparationDescription = extra;
            parsed.push({
              text: extra,
              styling: preparationDescriptionStyling,
            });
          }
          break;
        }
      } catch (error) {
        console.error('Error searching for ingredient:', error);
      }
    }

    parsed.push({ text: word, styling: ignoredStyling });
  }

  return {
    amount,
    unit,
    ingredient,
    preparationDescription,
    parsed,
  };
}
