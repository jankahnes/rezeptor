export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ff, giProxy, waterE, kcal } = body as {
    ff: number;
    giProxy: number;
    waterE: number;
    kcal: number;
  };
  if([ff, giProxy, waterE, kcal].some((value) => value === null || isNaN(value))) {
    return 0;
  }
  const response = await $fetch("https://jk-api.onrender.com/predict-satiety", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: {
      ff,
      gi_proxy: giProxy,
      waterE,
      kcal,
    },
  });

  return response;
});