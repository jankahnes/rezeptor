export const useRecipes = (opts?: GetterOpts) =>
  useLazyAsyncData(() => $fetch('/api/db/recipes', { params: opts }));
