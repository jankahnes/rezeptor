export const useFoods = (opts?: GetterOpts) =>
  useLazyAsyncData(() => $fetch('/api/db/foods', { params: opts }));
  