import OpenAI from 'openai';
import { getModelConfig } from '~~/server/utils/state';

export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig();
  const openai = new OpenAI({ apiKey: config.gptKey });

  try {
    const body = await readBody(event);
    const prompt = body.prompt;
    const mimeType = body.mimetype;
    const base64Image = body.imageBase64;
    
    if (!base64Image) {
      throw new Error('No image file found in request');
    }

    if (!prompt) {
      throw new Error('No prompt found in request');
    }
    console.log('🔍 Starting vision call');
    // @ts-ignore - openai library is incorrectly marking 'minimal' as invalid, however gpt-5 models do support it.
    const response = await openai.responses.create({
      ...getModelConfig('vision'),
      input: [
        { 
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt
            },
            {
              type: 'input_image',
              image_url: `data:${mimeType};base64,${base64Image}`,
              detail: 'auto'
            }
          ]
        }
      ],
    });
    console.log('🔍 Finished vision call');
    const rawContent = response.output_text;
    if (!rawContent) {
      throw new Error('No content returned from GPT response');
    }

    // Try to parse JSON from the response
    let jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
      // Try to find JSON without code blocks
      jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error('Could not extract JSON from GPT response');
    }

    const extractedData = JSON.parse(jsonMatch[0] || jsonMatch[1]);
    
    // Check for error responses
    if (extractedData.error) {
      throw new Error(extractedData.error);
    }

    return extractedData;
  } catch (err) {
    console.error('GPT picture analysis error:', err);
    throw err;
  }
});
