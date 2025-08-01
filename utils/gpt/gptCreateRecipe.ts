import extractJson  from "~/utils/format/extractJson";


export default async function (recipe: RecipeProcessed, considerProsessing: boolean) {
    const SYSTEM_PROMPT = `
    You will be given information about a recipe (May or may not include instructions, but definitely title and ingredients).
    Your task is to infer, per ingredient, how that ingredient is processed when making that recipe. 
    As the instructions may be missing, you may have to infer the way the ingredients are probably processed, based on common recipes, title, and ingredient composition.
    Example: Potatoes are never eaten raw, so they are always at least cooked. 

    {
        "processing_info": [
            {	
                "ingredient_name": String
                "thermal_intensity": Enum{"LOW", "MEDIUM", "HIGH"}
                "heat_medium": Enum{"WET", "DRY", "FAT", "RADIATION"}
                "mechanical_disruption": Enum{0,1,2}
                "thermal_description": String
                "mechanical_description": String
                "hydration_factor": Float
            }, ...
        ]
        "saltiness": Enum{0,1,2}
    }

    Some definitions:
    If no heat is applied, omit thermal_intensity and heat_medium.
    The Intensity definitions are: 50-99C (Low), 100-180C (Medium), 180+C (High)
    The Heat Medium Definitions:
    Use "WET" only if Food is submerged in water or other water-based liquids. (Steamed is Dry!)
    Use "FAT" if fat is expected to act as primary heat transfer medium. (Pan fried -> Fat, Roasted -> Dry)
    Use "RADIATION" for microwaved ingredients.
    Use "DRY" for every other form of heat.
    The Disruption Definitions: 0=Intact, 1=Minimal/Chopped, 2=Blended/Pureed

    For the Processing Tags, just use common sense to describe the processing done. If its obvious that an ingredient is not processed in either, omit that tag.
    (Recipe describes cubed, roasted Potatoes) -> thermal_description: "Roasted", mechanical_description: "Cubed"
    (Recipe describes Salad) -> both descriptions omitted (As users can infer salad is never cooked, maybe put "Chopped" if explicitly stated)
    (Recipe describes whole, raw cherry tomatoes) -> thermal_description: "Raw", mechanical_desciption: "Whole"
    If you can not infer the processing type, base it off probability and use generic terms such as "Cooked". 

    Use the hydration factor to signify how much weight you expect that ingredient to gain or lose during making the Recipe.
    For example, Pasta: ~2.2
    Or when reducing a sauce, for each water-based ingredient in the sauce: 0.5
    Pay attention to the ingredient names! Assume that every ingredient is raw, unless stated otherwise. If it instead indicates that the ingredient is already cooked, it has to have a hydration_factor 1. 
    If the ingredient is Pasta (Cooked) for example, it has to have a hydration_factor 1. 

    Finally, choose one salt status for the whole recipe. Generally, if a specific amount of added salt is already specified in the ingredients list, leave at 0. 
    If its not there or "To Taste", choose:
    If you expect the recipe to either not have added salt at all, or to have added salt but not taste salty, leave at 0. (Matches all sweet dishes and some baked goods) Resulting salt level will be 0.2g/100g.
    If you expect the recipe to taste lightly salted, put 1. (Matches some salads, bowls or cold snacks). Resulting salt level will be 0.5g/100g.
    If you expect the recipe to taste savory, put 2. (Matches almost all savory dishes, dinners, soups, bread, etc). Resulting salt level will be 1.1g/100g.
    If you expect the recipe to taste explicitly salty, put 3. (Matches only recipes that are known to be salty, like french fries, deep fried foods, some restaurant-style dishes). Resulting salt level will be 1.6g/100g.

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
     "difficulty": Enum{EASY, MEDIUM, HARD}
     "effort": Enum{LIGHT, MODERATE, HEAVY}
     "tags": int[]
     }

     Important: Before writing the JSON Object, write out some lines for thinking/commenting purposes. It makes your thought process more clear. After that, you can just start the JSON object with {, it will be parsed automatically. 
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
        ${ingredient.name} - ${ingredient.amount} ${ingredient.unit}
        `;
     }}
     let parsed = {
      general: null
     }

    try {
        if (considerProsessing) {
      const response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT,
          message: message,
        },
      });
      if(!response) throw new Error('No content returned from GPT response');
      parsed = JSON.parse(extractJson(response));

    }
      const general_response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT_GENERAL,
          message: message,
        },
      });
      if(!general_response) throw new Error('No content returned from GPT response');
      const general_parsed = JSON.parse(extractJson(general_response));
  
      parsed.general = general_parsed
      return parsed;
    } catch (err) {
      console.error('gptCreateRecipe error:', err);
      throw err;
    }  
  }