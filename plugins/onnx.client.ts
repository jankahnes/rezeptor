import * as ort from 'onnxruntime-web';

export default defineNuxtPlugin((nuxtApp) => {
  ort.env.wasm.wasmPaths = '/ort/';
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.simd = true;
  ort.env.debug = true;
  nuxtApp.provide('ort', ort);
});
