export const useFoodNames = (opts?: GetterOpts) => {
    const { useAsyncDataWithLoading } = useGlobalLoading();
    return useAsyncDataWithLoading('foodnames', () =>
      $fetch('/api/db/foodnames', { params: opts })
    );
  };