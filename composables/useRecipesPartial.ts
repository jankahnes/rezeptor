export const useRecipesPartial = (opts?: GetterOpts) => {
  const { useAsyncDataWithLoading } = useGlobalLoading();
  return useAsyncDataWithLoading('recipes-partial', () =>
    $fetch('/api/db/recipes-partial', { params: opts })
  );
};
