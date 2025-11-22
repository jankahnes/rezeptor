export const useRequestsStore = defineStore('requests', () => {
    const requestsOpen = ref(false);
    const requestsLoading = ref(false);
    const requests = ref<FoodRequest[]>([]);

    return {
      requestsOpen,
      requests,
      requestsLoading,
    };
  });
  