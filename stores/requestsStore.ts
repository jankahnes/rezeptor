export const useRequestsStore = defineStore('requests', () => {
    const requestsOpen = ref(false);
    const requests = ref([]);
    const requestsLoading = ref(false);

    return {
      requestsOpen,
      requests,
      requestsLoading,
    };
  });
  