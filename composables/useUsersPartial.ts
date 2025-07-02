export const useUsersPartial = (opts?: GetterOpts) =>
  useLazyAsyncData(() => $fetch('/api/db/users-partial', { params: opts }));
