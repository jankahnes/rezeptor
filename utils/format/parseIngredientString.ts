
import type { SupabaseClient } from '@supabase/supabase-js';

const amountStyling = "font-semibold py-1 px-2 rounded-md bg-gray-100 text-gray-600";
const unitStyling = "font-normal italic text-gray-600 py-1 px-2 rounded-md bg-gray-100";
const ingredientStyling = "font-bold text-gray-800 py-1 px-2 rounded-md bg-gray-200";
const extraStyling = "font-light italic text-gray-600";
const ignoredStyling = "font-normal text-gray-600 py-1 px-2 rounded-md bg-gray-50";

const ignoreWords = ["a", "an", "the", "of"];

const numeric = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7,
    "eight": 8, "nine": 9, "ten": 10, "half": 0.5, "quarter": 0.25, "three-quarters": 0.75,
    '½': 0.5, '¼': 0.25, '¾': 0.75, '⅓': 1/3, '⅔': 2/3, '⅛': 0.125, '⅜': 0.375, 
    '⅝': 0.625, '⅞': 0.875, 'dozen': 12,
};

const units = {
    'g': 'g', 'gram': 'g', 'grams': 'g',
    'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
    'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
    'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
    'pinch': 'free',
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

function parseNumberUnit(word: string): { number: number; unit: string; originalText: string; numberPart: string; unitPart: string } | null {
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
        if (units[lowerUnit as keyof typeof units]) {
            let numberValue: number;
            if (numericPart.includes('/')) {
                const [num, den] = numericPart.split('/');
                numberValue = Number(num) / Number(den);
            } else {
                numberValue = Number(numericPart);
            }
            
            return {
                number: numberValue,
                unit: units[lowerUnit as keyof typeof units],
                originalText: cleanWord,
                numberPart: numericPart,
                unitPart: unitPart,
            };
        }
    }
    
    return null;
}

type ParsedPart = {
    text: string;
    styling: string;
}

export async function parseIngredientString(client: SupabaseClient, ingredientString: string) {
    let amount = null;
    let unit = null;
    let ingredient = null;
    let extra = null;

    const tokens = ingredientString.split(' ').filter(word => word.trim() !== '').map(word => word.trim());
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
        if (units[lowerWord as keyof typeof units]) {
            unit = units[lowerWord as keyof typeof units];
            parsed.push({ text: word, styling: unitStyling });
            continue;
        }
        
        // Everything else should be ingredient name - take remaining words
        const remainingWords = tokens.slice(i).join(' ');
        
        // The rest is ingredient. Stop parsing ingredient if we find a ( or ,
        // Check if it matches pattern: ingredient (extra) OR ingredient, (any amt of spaces) extra
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
        
        if (searchTerm) {
            try {
                const { data, error } = await client.rpc('search_foods_top', {
                    query: searchTerm,
                });
                
                if (data?.[0]) {
                    ingredient = data[0];
                    parsed.push({ text: ingredient.name, styling: ingredientStyling });
                    if (extra) {
                        extra = extra.replace(/^,/, '');
                        parsed.push({ text: extra, styling: extraStyling });
                    }
                    break;
                }
            } catch (error) {
                console.error('Error searching for ingredient:', error);
            }
        }
        
        // If no ingredient found, mark as ignored
        parsed.push({ text: word, styling: ignoredStyling });
    }
    if(!unit) {
        unit = 'UNITS';
    }
    return {
        amount,
        unit,
        ingredient,
        extra,
        parsed,
    };
}