export const useUser = (opts?: GetterOpts) =>
  useLazyAsyncData(() => $fetch('/api/db/user', { params: opts }));
