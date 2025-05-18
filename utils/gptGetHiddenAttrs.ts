export default async function (name: String) {
  const SYSTEM_PROMPT = `For a given food item, return the following fields:
-density (g/ml)
-piece_weight (g)

For piece_weight: If the given food can be measured in "pieces" or "units" (bananas, oreos), return the weight of an average or medium piece. If it can not be measured in pieces, put null.
Use estimation.
Output as valid JSON. Do not comment further.
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
