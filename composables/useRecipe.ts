export const useRecipe = (opts?: GetterOpts) => {
  const { useAsyncDataWithLoading } = useGlobalLoading();
  return useAsyncDataWithLoading('recipe', () =>
    $fetch('/api/db/recipe', { params: opts })
  );
};
