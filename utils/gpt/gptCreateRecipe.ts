export default async function (recipe: RecipeProcessed) {
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
     

    try {
      const response = await $fetch('/api/gpt/getResponse', {
        method: 'POST',
        body: {
          systemPrompt: SYSTEM_PROMPT,
          message: message,
        },
      });
  
      if (!response) throw new Error('No content returned from GPT response');
  
      const parsed = JSON.parse(extractJson(response));
  
      return parsed;
    } catch (err) {
      console.error('gptCreateRecipe error:', err);
      throw err;
    }  
  }