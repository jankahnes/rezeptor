export const useUser = (opts?: GetterOpts, key?: string) =>
  useFetch('/api/db/user', {
    params: opts,
    lazy: true,
    key: key ? `user-${key}` : undefined,
  });
