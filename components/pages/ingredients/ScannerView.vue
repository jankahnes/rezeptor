<template>
  <div class="relative w-full h-[calc(100svh_-_370px)] p-5">
    <div v-if="scannedCode" class="text-xl font-bold text-center">
      Code scanned: {{ scannedCode }}
    </div>
    <video
      v-else
      ref="videoElement"
      autoplay
      playsinline
      muted
      class="w-full h-full object-cover"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { BrowserMultiFormatReader } from '@zxing/browser';

const props = defineProps({
  onDecode: {
    type: Function,
    required: true,
  },
});

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
          props.onDecode(scannedCode.value);
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
