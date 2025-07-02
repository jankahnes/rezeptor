export const useActivity = (opts?: GetterOpts) =>
  useLazyAsyncData(() => $fetch('/api/db/activity', { params: opts }));
