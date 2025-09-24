import OpenAI from 'openai';
import { getModelConfig } from '~/server/utils/state';

export default defineEventHandler(async (event): Promise<string> => {
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const openai = new OpenAI({ apiKey: config.gptKey });
  console.log('🔍 Getting GPT resonse using config:', getModelConfig(body.type));
  try {
    const response = await openai.responses.create({
      ...getModelConfig(body.type),
      instructions: body.systemPrompt,
      input: body.message,
       });
    const raw = response.output_text;
    if (!raw) throw new Error('No content returned from GPT response');
    return raw;
  } catch (err) {
    console.error('GPT error 765:', err);
    throw err;
  }
});
