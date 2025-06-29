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
  const { $ort } = useNuxtApp();

  const sessionPromise = $ort.InferenceSession.create('/sidx.onnx', {
    executionProviders: ['wasm'],
  });

  const session = await sessionPromise;

  const input = new $ort.Tensor(
    'float32',
    Float32Array.from([ff, giProxy, waterE, kcal]),
    [1, 4]
  );

  const results = await session.run({ features: input });
  console.log(results);
  const output = results.output ?? Object.values(results)[0];
  const prediction = Number(output.data[0]);

  return prediction;
}
