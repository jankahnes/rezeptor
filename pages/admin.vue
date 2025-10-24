<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <h1 class="text-3xl font-bold mb-8 text-center">AI Model Configuration</h1>

    <div class="grid gap-6 md:grid-cols-2">
      <div
        v-for="type in types"
        :key="type"
        class="bg-white rounded-lg shadow-md p-6"
      >
        <h2 class="text-xl font-semibold mb-4 capitalize text-gray-800">
          {{ type }} Model
        </h2>

        <div class="space-y-4">
          <!-- Model Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <div class="relative h-12">
              <FormsDropdown
                :choices="possibleModels"
                :modelValue="getConfigForType(type)?.model || ''"
                @update:modelValue="(value: string) => updateModel(type, value)"
                class="border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Reasoning Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Reasoning Level
            </label>
            <div class="relative h-12">
              <FormsDropdown
                :choices="possibleReasoning"
                :modelValue="getConfigForType(type)?.reasoning || ''"
                @update:modelValue="(value: string) => updateReasoning(type, value)"
                class="border border-gray-300 rounded-lg bg-white hover:border-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <!-- Current Configuration Display -->
          <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600">
              <span class="font-medium">Current:</span>
              {{ getConfigForType(type)?.model || 'Loading...' }}
              <span class="text-gray-400">•</span>
              {{ getConfigForType(type)?.reasoning || 'Loading...' }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <h2 class="text-2xl font-bold mt-8 text-center">
      Model Usage In the pipeline
    </h2>
    <p>Unit Reconciliation uses <strong>quick</strong> model.</p>
    <p>Food searching and judging uses <strong>default</strong> model.</p>
    <p>Food creation uses <strong>accurate</strong> model.</p>
    <p>Vision uses <strong>vision</strong> model.</p>
    <p>Description and instructions creation uses <strong>default</strong> model.</p>
    <p>Formalizing ingredient string + splitting names uses <strong>default</strong> model.</p>
    <p>
      For full nutri processing, uses <strong>accurate</strong> model for processing info,
      <strong>default</strong> model for everything else.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ModelConfig } from '~/server/utils/state';
import type { ReasoningEffort } from 'openai/resources.mjs';

const types = ['quick', 'vision', 'default', 'accurate'];
const possibleReasoning = ['minimal', 'low', 'medium', 'high'];
const possibleModels = [
  'gpt-5-nano', //0.05$ Input, 0.40$ Output
  'gpt-5-mini', //0.25$ Input, 2$ Output
  'gpt-5', //1.25$ Input, 10$ Output
  'gpt-4.1', //2$ Input, 8$ Output
  'gpt-4.1-mini', //0.4$ Input, 1.60$ Output
  'gpt-4.1-nano', //0.1$ Input, 0.40$ Output
];

const configs = ref<(ModelConfig & { type: string })[]>([]);

// Helper function to get config for a specific type
const getConfigForType = (type: string) => {
  return configs.value.find((config) => config.type === type);
};

// Handle model updates
const updateModel = async (type: string, model: string) => {
  const config = getConfigForType(type);
  if (config && config.model !== model) {
    try {
      await setModelConfig(type, model, config.reasoning as string);
      // Update local state
      config.model = model;
    } catch (error) {
      console.error('Failed to update model:', error);
    }
  }
};

// Handle reasoning updates
const updateReasoning = async (type: string, reasoning: string) => {
  const config = getConfigForType(type);
  if (config && config.reasoning !== reasoning) {
    try {
      await setModelConfig(type, config.model, reasoning);
      // Update local state
      config.reasoning = reasoning as ReasoningEffort | "minimal";
    } catch (error) {
      console.error('Failed to update reasoning:', error);
    }
  }
};

onMounted(async () => {
  try {
    // Use Promise.all to load all configs simultaneously
    const configPromises = types.map(async (type) => {
      const config = (await $fetch(`/api/gpt/get-model-config`, {
        method: 'POST',
        body: { type: type },
      })) as ModelConfig;
      return { ...config, type };
    });

    configs.value = await Promise.all(configPromises);
  } catch (error) {
    console.error('Failed to load configs:', error);
  }
});

const setModelConfig = async (
  type: string,
  model: string,
  reasoning: string
) => {
  await $fetch(`/api/gpt/set-model-config`, {
    method: 'POST',
    body: { type: type, model: model, reasoning: reasoning },
  });
};
</script>

<style scoped></style>
