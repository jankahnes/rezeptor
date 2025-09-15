export const useFoodName = (opts?: GetterOpts) => {
    const { useAsyncDataWithLoading } = useGlobalLoading();
    return useAsyncDataWithLoading('foodname', () =>
      $fetch('/api/db/foodname', { params: opts })
    );
  };