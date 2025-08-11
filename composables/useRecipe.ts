export const useRecipe = (opts?: GetterOpts) => {
  const { useAsyncDataWithLoading } = useGlobalLoading();
  const key = opts?.eq?.id ? `recipe-${opts.eq.id}` : 'recipe';
  return useAsyncDataWithLoading(key, () =>
    $fetch('/api/db/recipe', { params: opts })
  );
};
