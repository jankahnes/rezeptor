import { getModelConfig } from '~~/server/utils/state';


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const config = getModelConfig(body.type);
    return {model: config.model, reasoning: config.reasoning?.effort};
});