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
          class="transition-all duration-300"
        >
          <div class="flex items-center gap-2">
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
                <img
                  class="h-8 w-8"
                  src="/loading.png"
                />
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

          <!-- Animated message for current step -->
          <Transition name="message-slide" mode="out-in">
            <div
              v-if="isCurrentStep(stepIndex) && job?.message"
              :key="job.message"
              class="ml-12 mt-2"
            >
              <p class="text-sm text-gray-600 italic">
                {{ job.message }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  jobId: number;
}>();

interface Job {
  id: string;
  step_index?: number;
  updated_at: string;
  type: string;
  [key: string]: any;
  message: string | null;
}

const job = ref<Job | null>(null);
const supabase = useSupabaseClient();
const pollingRate = ref(1000);
let pollingInterval: NodeJS.Timeout | null = null;
const steps = ref<{ [key: number]: string }>({});
const pollingRates = ref<{ [key: number]: number }>({});

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
        pollingRates.value[
          job.value.step_index as keyof typeof pollingRates.value
        ] ?? 5000;

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

async function fetchAndStartPolling() {
  if (!props.jobId || job.value) return;
  job.value = (
    await supabase.from('jobs').select('*').eq('id', props.jobId).single()
  ).data;

  if (job.value?.type === 'link') {
    steps.value = {
      0: '🌐 Scraping recipe from website',
      1: '📝 Parsing ingredients',
      2: '🔍 Extracting names',
      3: '🍎 Matching foods to our database',
      4: '📊 Adding up Nutrition Facts',
      6: '✨ Finishing up',
    };

    pollingRates.value = {
      0: 500,
      1: 2000,
      2: 2000,
      3: 4000,
      4: 4000,
    };
  } else if (job.value?.type === 'uploadable') {
    steps.value = {
      0: '📊 Adding up Nutrition Facts',
      6: '✨ Finishing up',
    };
    pollingRates.value = {
      0: 500,
      6: 500,
    };
  } else if (job.value?.type === 'natural-language') {
    steps.value = {
      0: '📝 Parsing ingredients',
      2: '🔍 Extracting names',
      3: '🍎 Matching foods to our database',
      4: '📊 Adding up Nutrition Facts',
      6: '✨ Finishing up',
    };

    pollingRates.value = {
      0: 2000,
      2: 2000,
      3: 4000,
      4: 4000,
    };
  } else if (job.value?.type === 'picture') {
    steps.value = {
      0: '📸 Analyzing your picture',
      1: '📝 Parsing ingredients',
      2: '🔍 Extracting names',
      3: '🍎 Matching foods to our database',
      4: '📊 Adding up Nutrition Facts',
      6: '✨ Finishing up',
    };
    pollingRates.value = {
      0: 8000,
      1: 2000,
      2: 2000,
      3: 4000,
      4: 4000,
    };
  }
  startPolling();
}
onMounted(async () => {
  await fetchAndStartPolling();
});

watch(
  () => props.jobId,
  async () => {
    await fetchAndStartPolling();
  }
);
onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
/* Message slide transition */
.message-slide-enter-active,
.message-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.message-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.message-slide-enter-to {
  opacity: 1;
  transform: translateX(0);
}

.message-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.message-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
