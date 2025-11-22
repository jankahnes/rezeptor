import type { Ref } from 'vue';

export interface PollingOptions {
  interval?: number;
  immediate?: boolean;
  onError?: (error: Error) => void;
}

export interface PollingState {
  isPolling: Ref<boolean>;
  error: Ref<Error | null>;
  start: () => void;
  stop: () => void;
  restart: () => void;
}

const POLLING_RATES = {
  formalizing_ingredients: 1000,
  formalizing_instructions: 500,
  pre_publish: 5000,
};

export function usePolling<T>(
  pollFn: () => Promise<T>,
  options: PollingOptions = {}
): PollingState {
  const { interval = 1000, immediate = false, onError } = options;

  const isPolling = ref(false);
  const error = ref<Error | null>(null);
  let pollingInterval: NodeJS.Timeout | null = null;

  const poll = async () => {
    try {
      error.value = null;
      await pollFn();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      error.value = errorObj;
      onError?.(errorObj);
    }
  };

  const start = () => {
    if (pollingInterval) return; // Prevent multiple intervals

    isPolling.value = true;
    pollingInterval = setInterval(poll, interval);

    if (immediate) {
      poll();
    }
  };

  const stop = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    isPolling.value = false;
  };

  const restart = () => {
    stop();
    start();
  };

  // Auto-cleanup on unmount
  onUnmounted(() => {
    stop();
  });

  return {
    isPolling: readonly(isPolling),
    error: readonly(error),
    start,
    stop,
    restart,
  };
}

// Specialized composable for job polling with dynamic intervals
export function useJobPolling(
  jobId: Ref<number | null>,
  supabase: any,
  defaultRate: number = 2000
) {
  const job = ref<any>(null);
  const currentPollingRate = ref(defaultRate);

  const pollJobStatus = async () => {
    if (!job.value?.id) return;

    try {
      const { data: currentJobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', job.value.id);

      if (error) {
        console.error('Error polling job status:', error);
        return;
      }

      if (currentJobs && currentJobs.length > 0) {
        const currentJob = currentJobs[0];
        const previousStepIndex = job.value?.step;
        job.value = currentJob;

        const newPollingRate =
          POLLING_RATES[job.value.step as keyof typeof POLLING_RATES] ??
          defaultRate;

        // If the step changed and polling rate should change, restart polling with new rate
        if (
          previousStepIndex !== job.value.step &&
          newPollingRate !== currentPollingRate.value
        ) {
          currentPollingRate.value = newPollingRate;
          restart();
        }
      } else {
        // Job was deleted
        job.value = null;
      }
    } catch (error) {
      console.error('Error during job polling:', error);
    }
  };

  const { isPolling, error, start, stop, restart } = usePolling(pollJobStatus, {
    interval: currentPollingRate.value,
    immediate: false,
  });

  const fetchJob = async () => {
    if (!jobId.value || job.value) return;

    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId.value);

    job.value = data && data.length > 0 ? data[0] : null;
  };

  // Watch for jobId changes
  watch(jobId, async () => {
    job.value = null;
    await fetchJob();
  });

  onMounted(async () => {
    await fetchJob();
  });

  return {
    job: readonly(job),
    isPolling,
    error,
    start,
    stop,
    restart,
    fetchJob,
  };
}
