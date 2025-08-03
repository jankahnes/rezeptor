export async function predictSatiety({
  ff,
  giProxy,
  waterE,
  kcal,
}: {
  ff: number;
  giProxy: number;
  waterE: number;
  kcal: number;
}): Promise<number> {
  if ([ff, giProxy, waterE, kcal].some((value) => value === null || isNaN(value))) {
    return 0;
  }
  const { prediction } = await $fetch('/api/predict/satiety', {
    method: 'POST',
    body: { ff, giProxy, waterE, kcal },
  });
  return prediction;
}
