export const useLoadingStore = defineStore('loading', () => {
  const loadingStates = ref<Map<string, boolean>>(new Map());
  const globalLoading = computed(() => {
    return Array.from(loadingStates.value.values()).some((state) => state);
  });

  function setLoading(key: string, isLoading: boolean) {
    loadingStates.value.set(key, isLoading);
  }

  function startLoading(key: string) {
    setLoading(key, true);
  }

  function stopLoading(key: string) {
    setLoading(key, false);
  }

  function clearLoading(key: string) {
    loadingStates.value.delete(key);
  }

  function clearAllLoading() {
    loadingStates.value.clear();
  }

  return {
    loadingStates: readonly(loadingStates),
    globalLoading,
    setLoading,
    startLoading,
    stopLoading,
    clearLoading,
    clearAllLoading,
  };
});
