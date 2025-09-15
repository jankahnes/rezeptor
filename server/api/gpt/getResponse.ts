import OpenAI from 'openai';

export default defineEventHandler(async (event): Promise<string> => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const openai = new OpenAI({ apiKey: config.gptKey });

  try {
    const response = await openai.responses.create({
      model: body?.model ||'gpt-5-mini',
      instructions: body.systemPrompt,
      input: body.message,
      reasoning: {effort: "low"}
       });
    const raw = response.output_text;
    if (!raw) throw new Error('No content returned from GPT response');
    return raw;
  } catch (err) {
    console.error('GPT error 765:', err);
    throw err;
  }
});
