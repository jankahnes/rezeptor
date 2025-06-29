import path from 'path';

let model: any;
const modelPath = path.resolve(process.cwd(), 'server/models/sidx.cbm');

let modelLoaded = false;

export default defineEventHandler(async (event) => {
  const { default: catboost } = await import('catboost');
  model = new catboost.Model();
  if (!modelLoaded) {
    model.loadModel(modelPath);
    modelLoaded = true;
  }

  const body = await readBody(event);
  const { ff, giProxy, waterE, kcal } = body;

  const features = [[ff, giProxy, waterE, kcal]];
  const pred = model.predict(features)[0];

  return { prediction: pred };
});
