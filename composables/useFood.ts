export const useFood = (opts?: GetterOpts) => {
  const { useAsyncDataWithLoading } = useGlobalLoading();
  return useAsyncDataWithLoading('food', () =>
    $fetch('/api/db/food', { params: opts })
  );
};