export const useGlobalLoading = () => {
  const loadingStore = useLoadingStore();

  const trackLoading = (isLoading: Ref<boolean>) => {
    if (process.client) {
      const stopWatch = watch(
        isLoading,
        (newValue) => {
          loadingStore.globalLoading = newValue;
        },
        { immediate: true }
      );

      onUnmounted(() => {
        stopWatch();
      });
    }
  };

  const withLoading = async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      loadingStore.startLoading();
      const result = await operation();
      return result;
    } finally {
      loadingStore.stopLoading();
    }
  };

  const useAsyncDataWithLoading = (
    key: string,
    handler: any,
    options?: any
  ) => {
    const result = useAsyncData(key, handler, options);
    trackLoading(result.pending);
    return result;
  };

  const useLazyAsyncDataWithLoading = (
    key: string,
    handler: any,
    options?: any
  ) => {
    const result = useLazyAsyncData(key, handler, options);
    trackLoading(result.pending);
    return result;
  };

  return {
    globalLoading: loadingStore.globalLoading,
    trackLoading,
    withLoading,
    useAsyncDataWithLoading,
    useLazyAsyncDataWithLoading,
    startLoading: loadingStore.startLoading,
    stopLoading: loadingStore.stopLoading,
  };
};
