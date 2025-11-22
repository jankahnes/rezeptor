export default function stripKeys<T>(
  obj: any,
  validKeys: readonly string[]
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => validKeys.includes(key))
  ) as Partial<T>;
}
