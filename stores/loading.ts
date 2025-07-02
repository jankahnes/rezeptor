export const useLoadingStore = defineStore('loading', () => {
  const globalLoading = ref(false);

  function startLoading() {
    globalLoading.value = true;
  }

  function stopLoading() {
    globalLoading.value = false;
  }

  return {
    globalLoading,
    startLoading,
    stopLoading,
  };
});
