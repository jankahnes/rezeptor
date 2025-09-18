<template>
  <div class="flex justify-center">
    <div class="">
      <h1 class="text-3xl font-bold my-12 text-gray-800">
        Importing your Recipe
      </h1>

      <div class="space-y-4">
        <div
          v-for="(stepText, stepIndex) in steps"
          :key="stepIndex"
          class="flex items-center transition-all duration-300 gap-2"
        >
          <div class="w-10 h-10 flex items-center justify-center">
            <!-- Checkmark for completed steps -->
            <span
              v-if="isStepCompleted(stepIndex)"
              class="w-8 h-8 material-symbols-outlined text-center text-2xl"
            >
              check
            </span>

            <!-- Loading animation for current step -->
            <div
              v-else-if="isCurrentStep(stepIndex)"
              class="w-8 h-8 transition-all duration-500 flex items-center justify-center"
            >
              <ClientOnly>
                <Vue3Lottie
                  class="flex items-center justify-center"
                  animationLink="/loading-alt.json"
                  :width="32"
                  :height="32"
                  :scale="2"
                />
              </ClientOnly>
            </div>

            <!-- Empty circle for pending steps -->
            <div
              v-else
              class="w-2 h-2 border-2 border-gray-300 rounded-full transition-all duration-300 opacity-40"
            ></div>
          </div>

          <p
            class="font-medium"
            :class="{ 'text-gray-300': isPendingStep(stepIndex) }"
          >
            {{ stepText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Job {
  id: string;
  step_index?: number;
  updated_at: string;
  [key: string]: any;
}

const route = useRoute();
const auth = useAuthStore();
const job = ref<Job | null>(null);
const supabase = useSupabaseClient();
const pollingRate = ref(1000);
let pollingInterval: NodeJS.Timeout | null = null;

const steps = {
  0: '🌐 Scraping recipe from website',
  1: '📝 Parsing ingredients',
  2: '🔍 Extracting names',
  3: '🍎 Matching foods to our database',
  4: '📊 Adding up Nutrition Facts',
  6: '✨ Finishing up',
};

const pollingRates = {
  0: 500,
  1: 4000,
  2: 4000,
  3: 3000,
  4: 10000,
};

// Helper functions for step states
const getCurrentStepIndex = () => {
  return job.value?.step_index ?? 0;
};

const isStepCompleted = (stepIndex: number) => {
  return getCurrentStepIndex() > stepIndex;
};

const isCurrentStep = (stepIndex: number) => {
  return getCurrentStepIndex() == stepIndex;
};

const isPendingStep = (stepIndex: number) => {
  return getCurrentStepIndex() < stepIndex;
};

const pollJobStatus = async () => {
  if (!job.value?.id) return;

  try {
    const { data: currentJob, error } = await (supabase as any)
      .from('jobs')
      .select('*')
      .eq('id', job.value.id)
      .single();

    if (error) {
      console.error('Error polling job status:', error);
      return;
    }

    if (currentJob) {
      const previousStepIndex = job.value?.step_index;
      job.value = currentJob as Job;

      const newPollingRate =
        pollingRates[job.value.step_index as keyof typeof pollingRates] ?? 5000;

      // If the step changed and polling rate should change, restart polling with new rate
      if (
        previousStepIndex !== job.value.step_index &&
        newPollingRate !== pollingRate.value
      ) {
        pollingRate.value = newPollingRate;
        restartPolling();
      }
    }
  } catch (error) {
    console.error('Error during job polling:', error);
  }
};

const startPolling = () => {
  if (pollingInterval) return; // Prevent multiple intervals

  pollingInterval = setInterval(pollJobStatus, pollingRate.value);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const restartPolling = () => {
  stopPolling();
  startPolling();
};

let rawUrl = route.params.url as string;
rawUrl = decodeURIComponent(rawUrl as string);
if (!/^https?:\/\//i.test(rawUrl)) {
  rawUrl = 'https://' + rawUrl;
}
let validUrl;
try {
  validUrl = new URL(rawUrl); // will throw if invalid
} catch {
  validUrl = null;
}

if (!validUrl) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid URL',
  });
}

const importRecipe = async () => {
  const { data: jobData, error } = await (supabase as any)
    .from('jobs')
    .insert({
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !jobData) {
    throw createError({
      statusCode: 500,
      statusMessage:
        'Failed to create job: ' + (error?.message || 'No data returned'),
    });
  }

  job.value = jobData as Job;

  // Start polling for job status updates
  startPolling();

  const response = (await $fetch('/api/create-recipe/from-link', {
    method: 'POST',
    body: {
      link: validUrl.href,
      jobId: job.value?.id,
      args: {
        publish: false,
        source_type: 'website',
        source: validUrl.href,
        based_on: null,
        user_id: auth.user?.id ?? null,
      },
    },
  })) as any;

  // Stop polling when the import is complete
  stopPolling();

  if (job.value?.id) {
    await (supabase as any).from('jobs').delete().eq('id', job.value.id);
  }

  const { status, id } = response;
  if (status === 'ok') {
    navigateTo(`/recipe/${id}`);
  } else {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to import recipe: ' + status,
    });
  }
};

importRecipe();

// Cleanup polling when component is unmounted
onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped></style>
