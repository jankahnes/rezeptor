<template>
  <div class="scanner-view">
    <div v-if="scannedCode" class="scanner-result">
      Code scanned: {{ scannedCode }}
    </div>
    <video
      v-else
      ref="videoElement"
      autoplay
      playsinline
      muted
      class="scanner-video"
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
    const deviceId = devices[0]?.deviceId;

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

<style scoped>
.scanner-view {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-result {
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
}
</style>
