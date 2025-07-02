export const useRecipesPartial = (optsFn: () => GetterOpts, key?: string) => {
  return useLazyAsyncData(
    key ? `recipes-partial-${key}` : 'recipes-partial',
    () => $fetch('/api/db/recipes-partial', { params: optsFn() }),
    {
      server: true,
    }
  );
};
