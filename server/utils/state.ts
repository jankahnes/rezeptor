import type { ReasoningEffort } from 'openai/resources.mjs';

export interface ModelConfig {
  model: string;
  reasoning: ReasoningEffort | 'minimal';
}

export interface GlobalState {
  quick: ModelConfig;
  vision: ModelConfig;
  default: ModelConfig;
  accurate: ModelConfig;
}

// Initial state. OpenAI library is incorrectly marking 'minimal' as invalid, however gpt-5 models do support it.
let state: GlobalState =
  process.env.NODE_ENV === 'production'
    ? {
        quick: { model: 'gpt-5-nano', reasoning: 'minimal' },
        vision: { model: 'gpt-5-mini', reasoning: 'low' },
        default: { model: 'gpt-5-mini', reasoning: 'low' },
        accurate: { model: 'gpt-5', reasoning: 'low' },
      }
    : {
        quick: { model: 'gpt-5-nano', reasoning: 'minimal' }, //was low  for curated recipes
        vision: { model: 'gpt-5-mini', reasoning: 'low' }, //was medium  for curated recipes
        default: { model: 'gpt-5-mini', reasoning: 'low' }, //was medium  for curated recipes
        accurate: { model: 'gpt-5', reasoning: 'low' },
      };

export function getModelConfig(type: keyof GlobalState) {
  if (!state[type].reasoning) {
    return { model: state[type].model };
  }
  return {
    model: state[type].model,
    reasoning: { effort: state[type].reasoning },
  };
}

export function getState(): GlobalState {
  return state;
}

export function setState(newState: Partial<GlobalState>): void {
  state = { ...state, ...newState };
}
