import { getModelConfig, setState } from '~~/server/utils/state';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if(!body.model.startsWith('gpt-5') && body.reasoning) {
        throw new Error('Reasoning is not supported for this model');
    }
    setState({[body.type]: {model: body.model, reasoning: body.reasoning}});
    return getModelConfig(body.type);
});
