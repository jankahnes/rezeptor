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
  const { prediction } = await $fetch('/api/predict/satiety', {
    method: 'POST',
    body: { ff, giProxy, waterE, kcal },
  });
  return prediction;
}
