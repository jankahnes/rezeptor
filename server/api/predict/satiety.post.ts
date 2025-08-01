export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { ff, giProxy, waterE, kcal } = body as {
    ff: number;
    giProxy: number;
    waterE: number;
    kcal: number;
  };

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