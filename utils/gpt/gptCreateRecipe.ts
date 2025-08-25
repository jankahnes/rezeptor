import extractJson  from "~/utils/format/extractJson";



export default async function (recipe: RecipeProcessed, considerProsessing: boolean) {
    const SYSTEM_PROMPT_PROCESSING = `
    You will be given information about a recipe.
    Your task is to infer, per ingredient, how that ingredient is processed when making that recipe. 
    As instructions may be missing, you may have to infer processing based on common cooking methods, recipe title, and ingredient composition.
    Example: Potatoes are typically cooked (never eaten raw), pasta is boiled, onions are often sautéed. Salad is never cooked.

    Return this JSON format:
    {
        "processing_info": [
            {	
                "ingredient_id": "ingredient ID from recipe",
                "thermal_intensity": "LOW" | "MEDIUM" | "HIGH" | null,
                "heat_medium": "WET" | "DRY" | "FAT" | "RADIATION" | null,
                "mechanical_disruption": 0 | 1 | 2,
                "thermal_description": "brief cooking method description",
                "mechanical_description": "brief prep description"
            }
        ]
    }

    Definitions:
    THERMAL INTENSITY (omit if no heat applied):
    - LOW: 50-99°C (simmering, gentle warming)
    - MEDIUM: 100-180°C (boiling, baking, standard cooking)  
    - HIGH: 180°C+ (frying, grilling, roasting at high heat)

    HEAT MEDIUM (omit if no heat applied):
    - WET: ingredient submerged in water/liquid (boiling, poaching, braising)
    - FAT: fat is primary heat transfer (pan-frying, deep-frying, sautéing)
    - DRY: air/surface heat (roasting, baking, grilling, steaming)
    - RADIATION: microwave cooking

    MECHANICAL DISRUPTION:
    - 0: Intact/whole (whole vegetables, whole cuts of meat)
    - 1: Minimal prep (chopped, diced, sliced)
    - 2: Highly processed (blended, pureed, ground, mashed)

    DESCRIPTIONS: Keep brief and practical. Omit if obvious/irrelevant.
    Examples:
    - Cubed roasted potatoes → thermal: "Roasted", mechanical: "Cubed"
    - Raw salad greens → thermal: omit, mechanical: "Chopped" (if applicable)
    - Whole cherry tomatoes → thermal: omit, mechanical: omit

     Important: Before writing the JSON Object, write out some lines for thinking/commenting purposes. It makes your thought process more clear. After that, you can just start the JSON object with {, it will be parsed automatically. 
     `;

     const SYSTEM_PROMPT_GENERAL = `
     You will be given information about a recipe.
     Your task is to infer some general information about the recipe: Effort, Difficulty, and general Tags.
     Effort is an enum of LIGHT, MODERATE, HEAVY. Light is <30minutes, Moderate is up to 90 minutes, Heavy is >90 minutes.
     Difficulty is an enum of EASY, MEDIUM, HARD. Self explanatory. If in doubt, put MEDIUM.
     General Tags, you can choose from:
     
     GENERAL CATEGORY: Choose 0-2
     meal prep:5
     family friendly:6
     gourmet:7
     date night:8
     comfort food:9
     one pot:10
     no cooking:11
     clean eating:12
     potluck:13
     paleo:106

    COURSE/FORMAT CATEGORY: Choose 1-3 (Use one course max, then specify if theres format(s) below that fit)
     main/dinner:200
     breakfast:201
     side:202
     snack:203
     dessert:204
     lunch:205
     appetizer:206

     soup:207
     salad:208
     drink:209
     wrap:210
     bowl:211
     stir fry:212
     pasta:213
     sandwich:214
     dip:215
     casserole:216
     cocktail:217
     bread:218
     cake:219
     other baked good:220

    CUISINE CATEGORY: Choose 1-2    
     global:300
     fusion:301
     italian:302
     german:303
     american:304
     vietnamese:305
     chinese:306
     japanese:307
     french:308
     british:309
     indian:310
     spanish:311
     middle eastern:312
     thai:313
     mediterranean:314
     greek:315
     turkish:316
     portuguese:317
     eastern european:318
     scandinavian:319
     basque:320
     korean:321
     malaysian:322
     african:323
     brazilian:324
     russian:325

     Output format as json:
     {
     "difficulty": "EASY" | "MEDIUM" | "HARD",
     "effort": "LIGHT" | "MODERATE" | "HEAVY",
     "tags": [int]
     }

     Important: Before writing the JSON Object, write out some lines for thinking/commenting purposes. It makes your thought process more clear. After that, you can just start the JSON object with {, it will be parsed automatically. 
     `;

     const SYSTEM_PROMPT_SALT_AND_FAT = `
     You will be given information about a recipe.
     Your task is to predict how much salt and additional cooking fat the average cook would add that isn't already listed in the ingredients.

     Return this JSON format:
     {
       "saltiness": 0 | 1 | 2 | 3,
       "added_fat": number
     }
    
    ADDED FAT (in grams for entire recipe):
    - Only count fat that would be added during cooking but isn't listed in ingredients
    - Consider cooking methods: sautéing, pan-frying, roasting, etc.
    - Account for absorption vs what stays in the pan
    - Examples:
      * Stir fry (no oil listed): ~15-25g oil for 4 servings, ~80% absorbed = 12-20g
      * Pan-fried chicken: ~10-15g oil per serving, ~70% absorbed
      * Roasted vegetables: ~5-10g oil per serving, mostly absorbed
      * Deep frying: calculate based on food surface area and absorption rates
    - If recipe already lists cooking oil/butter or no fat is needed at all, set to 0

    SALTINESS LEVEL (for entire recipe):
    - 0: No salt needed (sweet dishes, baked goods)
    - 1: Lightly salted (0.5g/100g final dish) - some salads, light snacks
    - 2: Normally salted (1g/100g final dish) - most savory dishes, soups, main courses
    - 3: Heavily salted (1.6g/100g final dish) - fries, chips, restaurant-style dishes

     Important: Before writing the JSON Object, write out some lines for thinking/commenting purposes. It makes your thought process more clear. After that, you can just start the JSON object with {, it will be parsed automatically. 
     `;

     const SYSTEM_PROMPT_HYDRATION_AND_CONSUMPTION_FACTORS = `
     You will be given information about a recipe.
     Your task is to predict weight changes during cooking and how much of each ingredient actually gets consumed.

     Return this JSON format:
     {
       "ingredients": [
         {
           "ingredient_id": "ingredient ID from recipe",
           "hydration_factor": number,
           "consumption_factor": number
         }
       ]
     }

     HYDRATION FACTOR (weight multiplier during cooking):
     - How much weight an ingredient gains/loses from raw state to final dish
     - Examples:
       * Raw pasta → cooked: ~2.2 (absorbs water)
       * Raw rice → cooked: ~2.5-3.0 (absorbs water)  
       * Fresh vegetables (sautéed): ~0.8-0.9 (loses water)
       * Meat (cooked): ~0.7-0.8 (loses fat/water)
       * Reducing sauces: ~0.3-0.6 (water evaporates)
       * Bread dough → baked: ~0.8-0.9 (water loss)
     - If ingredient name suggests it's pre-cooked (e.g., "cooked pasta"), use 1.0
     - Default for stable ingredients (oils, spices, canned goods): 1.0

     CONSUMPTION FACTOR (how much actually gets eaten):
     - What fraction of the ingredient ends up consumed vs discarded
     - Examples:
       * Regular ingredients: 1.0 (fully consumed)
       * Marinades: 0.05-0.15 (mostly discarded, some absorbed)
       * Wine in sauces: 0.3-0.7 (alcohol evaporates, flavor remains)
       * Frying oil: 0.0 (reused/discarded, except absorbed portion)
       * Herb sprigs for flavor: 0.0-0.1 (removed before serving)
       * Bones in stock: 0.0 (removed)
     - Default: 1.0 unless ingredient is clearly not fully consumed

     Consider the cooking method and ingredient type carefully for each prediction.
     Important: Before writing the JSON Object, write out some lines for thinking/commenting purposes. It makes your thought process more clear. After that, you can just start the JSON object with {, it will be parsed automatically. 
     You dont have to reason out each ingredient, but in categories. Marinade, sauce, dough, etc.
     `;



     let message = `
     Recipe Title: ${recipe.title}
     `;

     if (recipe.instructions) {
        message += `
        Instructions:
        `;
        for (let i = 0; i < recipe.instructions.length; i++) {
            message += `
            ${i + 1}. ${recipe.instructions[i]}
            `;
        }
     }
     message += `
     Ingredients:
     `;
     for (const category of recipe.ingredients_editable.ingredients) {
        message += `
        Category: ${category.categoryName}
        `;
        for (const ingredient of category.ingredients) {
        message += `
        ID: ${ingredient.id} - ${ingredient.name} - ${ingredient.amount} ${ingredient.unit}
        `;
     }}
     let parsed = {
      general: null,
      processing: null,
      salt_and_fat: null,
      hydration: null
     }

    try {
        if (considerProsessing) {
      const response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT_PROCESSING,
          message: message,
          model: 'gpt-5'
        },
      });
      if(!response) throw new Error('No content returned from GPT response');
      const processingResult = extractJson(response);
      if(!processingResult) throw new Error('No JSON found in processing response');
      parsed.processing = JSON.parse(processingResult);
      console.log("🔍 Processing info done.");
    }
      const general_response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT_GENERAL,
          message: message,
        },
      });
      if(!general_response) throw new Error('No content returned from GPT response');
      const general_result = extractJson(general_response);
      if(!general_result) throw new Error('No JSON found in general response');
      parsed.general = JSON.parse(general_result);
      console.log("🔍 General info done.");

      const salt_fat_response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT_SALT_AND_FAT,
          message: message,
        },
      });
      if(!salt_fat_response) throw new Error('No content returned from salt/fat response');
      const salt_fat_result = extractJson(salt_fat_response);
      if(!salt_fat_result) throw new Error('No JSON found in salt/fat response');
      parsed.salt_and_fat = JSON.parse(salt_fat_result);
      console.log("🔍 Salt and fat done.");

      // Hydration and Consumption factors
      const hydration_response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT_HYDRATION_AND_CONSUMPTION_FACTORS,
          message: message,
        },
      });
      if(!hydration_response) throw new Error('No content returned from hydration response');
      const hydration_result = extractJson(hydration_response);
      if(!hydration_result) throw new Error('No JSON found in hydration response');
      parsed.hydration = JSON.parse(hydration_result);
      console.log("🔍 Hydration done.");
      return parsed;
    } catch (err) {
      console.error('gptCreateRecipe error:', err);
      throw err;
    }  
  }