export const useGlobalLoading = () => {
  const loadingStore = useLoadingStore();

  // Track loading state for a specific key
  const trackLoading = (key: string, isLoading: Ref<boolean>) => {
    // Only track on client side to avoid SSR issues
    if (process.client) {
      watch(
        isLoading,
        (newValue) => {
          loadingStore.setLoading(key, newValue);
        },
        { immediate: true }
      );

      // Clean up when component unmounts
      onUnmounted(() => {
        loadingStore.clearLoading(key);
      });
    }
  };

  // Manual loading control
  const withLoading = async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      loadingStore.startLoading(key);
      const result = await operation();
      return result;
    } finally {
      loadingStore.stopLoading(key);
    }
  };

  // Simple wrapper for useAsyncData
  const useAsyncDataWithLoading = (
    key: string,
    handler: any,
    options?: any
  ) => {
    const result = useAsyncData(key, handler, options);
    trackLoading(key, result.pending);
    return result;
  };

  // Simple wrapper for useLazyAsyncData
  const useLazyAsyncDataWithLoading = (
    key: string,
    handler: any,
    options?: any
  ) => {
    const result = useLazyAsyncData(key, handler, options);
    trackLoading(key, result.pending);
    return result;
  };

  return {
    // Store access
    globalLoading: computed(() => loadingStore.globalLoading),
    loadingStates: computed(() => loadingStore.loadingStates),

    // Utilities
    trackLoading,
    withLoading,
    useAsyncDataWithLoading,
    useLazyAsyncDataWithLoading,

    // Direct store methods
    setLoading: loadingStore.setLoading,
    startLoading: loadingStore.startLoading,
    stopLoading: loadingStore.stopLoading,
    clearLoading: loadingStore.clearLoading,
    clearAllLoading: loadingStore.clearAllLoading,
  };
};
