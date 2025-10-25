export const useLoadingStore = defineStore('loading', () => {
  const globalLoading = ref(false);
  const toastLoadingMessage = ref('');
  const isTransient = ref(false);
  const timeout = ref<NodeJS.Timeout | null>(null);
  function startLoading() {
    globalLoading.value = true;
  }

  function stopLoading() {
    globalLoading.value = false;
  }

  function displayToast(message: string) {
    if (timeout.value) {
      clearTimeout(timeout.value);
    }
    isTransient.value = false;
    toastLoadingMessage.value = message;
  }

  function displayTransientToast(message: string) {
    isTransient.value = true;
    toastLoadingMessage.value = message;
    timeout.value = setTimeout(() => {
      toastLoadingMessage.value = '';
    }, 3000);
  }

  return {
    globalLoading,
    toastLoadingMessage,
    startLoading,
    stopLoading,
    displayToast,
    displayTransientToast,
    isTransient,
  };
});
