<template>
  <div class="relative h-[calc(100svh_-_370px)] mt-[5%] aspect-2/3 mx-auto">
    <div class="">
      <button
        @click="navigateTo('/foods')"
        class="button flex items-center justify-center p-2 text-2xl font-bold"
      >
        <span class="material-symbols-outlined"> arrow_back </span>
      </button>
    </div>
    <video
      ref="videoElement"
      autoplay
      playsinline
      muted
      class="w-full h-full object-cover rounded-lg shadow-main mt-2"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const videoElement = ref(null);
const scannedCode = ref('');
let codeReader;
let controls;

onMounted(async () => {
  codeReader = new BrowserMultiFormatReader();

  try {
    const devices = await BrowserMultiFormatReader.listVideoInputDevices();
    const rearCamera = devices.find(
      (d) =>
        d.label.toLowerCase().includes('back') ||
        d.label.toLowerCase().includes('rear')
    );
    const deviceId = rearCamera?.deviceId || devices[0]?.deviceId;

    controls = await codeReader.decodeFromVideoDevice(
      deviceId,
      videoElement.value,
      (result, error, _ctrl) => {
        if (result && !scannedCode.value) {
          scannedCode.value = result.getText();
          controls?.stop();
          navigateTo(`/foods/barcode-${scannedCode.value}`);
        }
      }
    );
  } catch (e) {
    console.error('Could not start barcode scanner:', e);
  }
});

onUnmounted(() => {
  controls?.stop();
});
</script>
