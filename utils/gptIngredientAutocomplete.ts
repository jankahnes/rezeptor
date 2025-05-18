export default async function (name: String) {
  const SYSTEM_PROMPT = `For a given food item, return the following fields:
- kcal (/100g)
- protein (g/100g)
- carbohydrates (g/100g)
- sugar (g/100g)
- fat (g/100g)
- saturated_fat (g/100g)
- fiber (g/100g)
- salt (g/100g)
- measurements (e.g. would you measure by pieces, volume or weight? contains a list that contains one or multiple of these three. banana -> ["weight", "pieces"] cocoa powder -> ["volume", "weight"]. for things like flour, think like a european. no cups or ounces.)
- avg_price (in EUR, Germany Market prices) (THIS IS IMPORTANT! ADJUST FOR THE 100g!)
- vegan (true/false)
- vegetarian (true/false)
- gluten_free (true/false)


Base your answer on reliable public nutritional databases (e.g. USDA, EFSA, EU, FAO) and general market prices. Anything is just estimation. Output as valid JSON. Do not comment further.
`;

  try {
    const response = await $fetch('/api/gpt/getResponse', {
      method: 'POST',
      body: {
        systemPrompt: SYSTEM_PROMPT,
        message: `Food item: ${name}`,
      },
    });

    if (!response) throw new Error('No content returned from GPT response');

    const parsed = JSON.parse(extractJson(response));

    return parsed;
  } catch (err) {
    console.error('gptIngredientAutocomplete error:', err);
    throw err;
  }
}
