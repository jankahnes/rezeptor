export const useUsers = (opts?: GetterOpts) =>
  useLazyAsyncData(() => $fetch('/api/db/users', { params: opts }));
