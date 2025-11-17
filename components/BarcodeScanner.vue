<template>
  <div class="fixed inset-0 z-50 bg-black/50">
    <!-- Close button -->
    <button
      @click="handleClose"
      class="absolute top-4 right-4 z-50 text-white bg-black/50 rounded-full p-2 h-10 w-10 flex items-center justify-center"
    >
      <span class="material-symbols-outlined text-3xl">close</span>
    </button>

    <div class="relative w-full h-[80%]">
      <!-- Video element for native BarcodeDetector -->
      <video
        v-if="useNativeDetector"
        ref="videoElement"
        autoplay
        playsinline
        muted
        class="w-full h-full object-cover"
      />

      <!-- Container for Quagga -->
      <div
        v-else
        ref="scannerContainer"
        class="w-full h-full overflow-hidden"
      ></div>

      <!-- Photo fallback prompt -->
      <transition name="fade-slide-up">
        <div
          v-if="showPhotoPrompt"
          class="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-3/4"
        >
          <button
            @click="triggerPhotoCapture"
            class="w-full bg-primary opacity-70 text-white font-semibold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2"
          >
            <span class="material-symbols-outlined">photo_camera</span>
            Couldn't detect barcode? Tap here to take a photo instead.
          </button>
        </div>
      </transition>

      <!-- Hidden file input for photo capture -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        class="hidden"
        @change="handlePhotoCapture"
      />
    </div>

    <div class="flex justify-between items-center w-full px-4 mt-4">
      <div class="bg-white/10 text-white px-4 py-2 rounded-lg text-sm">
        <div v-if="useNativeDetector" class="flex items-center gap-2">
          <span class="material-symbols-outlined">bolt</span>
          <span>Using Chrome's Barcode Detector</span>
        </div>
        <div v-else class="flex items-center gap-2">
          <span class="material-symbols-outlined">barcode</span>
          <span>Using Quagga Barcode Detector</span>
        </div>
      </div>
      <button
        v-if="torchAvailable"
        @click="toggleTorch"
        class="text-white text-2xl p-2"
      >
        <span class="material-symbols-outlined">
          {{ torchEnabled ? 'flashlight_on' : 'flashlight_off' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Quagga from '@ericblade/quagga2';

const emit = defineEmits<{
  detected: [barcode: string];
  close: [];
}>();

const scannerContainer = ref<HTMLElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const scannedCode = ref('');
const useNativeDetector = ref(false);
const showPhotoPrompt = ref(false);
const torchAvailable = ref(false);
const torchEnabled = ref(false);

let mediaStream: MediaStream | null = null;
let detectionInterval: ReturnType<typeof setInterval> | null = null;
let promptTimeout: ReturnType<typeof setTimeout> | null = null;
let barcodeDetector: any = null;
let videoTrack: MediaStreamTrack | null = null;
let quaggaDetectedHandler: ((result: any) => void) | null = null;

// Check if native BarcodeDetector is available
const checkNativeBarcodeDetector = () => {
  return 'BarcodeDetector' in window;
};

// Start native barcode detection
const startNativeDetection = async () => {
  try {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        focusMode: { ideal: 'continuous' },
        advanced: [{ focusMode: 'continuous' }, { torch: false }],
      },
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (videoElement.value) {
      videoElement.value.srcObject = mediaStream;
    }

    // Check torch capability
    videoTrack = mediaStream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities?.();
    if (capabilities && capabilities.torch) {
      torchAvailable.value = true;
    }

    barcodeDetector = new (window as any).BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
    });

    // Detect barcodes continuously
    detectionInterval = setInterval(async () => {
      if (
        videoElement.value &&
        videoElement.value.readyState === videoElement.value.HAVE_ENOUGH_DATA &&
        !scannedCode.value
      ) {
        try {
          const barcodes = await barcodeDetector.detect(videoElement.value);
          if (barcodes.length > 0) {
            scannedCode.value = barcodes[0].rawValue;
            stopDetection();
            emit('detected', barcodes[0].rawValue);
          }
        } catch (error) {
          console.error('Barcode detection error:', error);
        }
      }
    }, 300); // Check every 300ms
  } catch (error) {
    console.error('Error starting native detection:', error);
    // Fallback to Quagga
    useNativeDetector.value = false;
    await startQuaggaDetection();
  }
};

// Start Quagga detection
const startQuaggaDetection = async () => {
  try {
    await Quagga.init(
      {
        inputStream: {
          type: 'LiveStream',
          target: scannerContainer.value,
          constraints: {
            facingMode: 'environment',
            width: { min: 1280, ideal: 1920, max: 3840 },
            height: { min: 720, ideal: 1080, max: 2160 },
            focusMode: { ideal: 'continuous' },
            advanced: [{ focusMode: 'continuous' }],
          },
        },
        decoder: {
          readers: [
            'ean_reader',
            'ean_8_reader',
            'upc_reader',
            'upc_e_reader',
            'code_128_reader',
            'code_39_reader',
          ],
        },
        locate: true,
        frequency: 10, // Scan 10 times per second
      },
      (err: any) => {
        if (err) {
          console.error('Error initializing Quagga:', err);
          return;
        }
        Quagga.start();

        // Check torch capability for Quagga
        const stream = Quagga.CameraAccess.getActiveStreamLabel();
        if (stream) {
          const tracks = Quagga.CameraAccess.getActiveTrack();
          if (tracks) {
            const capabilities = tracks.getCapabilities?.();
            if (capabilities && capabilities.torch) {
              torchAvailable.value = true;
            }
          }
        }
      }
    );

    quaggaDetectedHandler = (result: any) => {
      if (result && result.codeResult && !scannedCode.value) {
        scannedCode.value = result.codeResult.code;
        stopDetection();
        emit('detected', result.codeResult.code);
      }
    };
    Quagga.onDetected(quaggaDetectedHandler);
  } catch (e) {
    console.error('Could not start barcode scanner:', e);
  }
};

// Toggle torch/flashlight
const toggleTorch = async () => {
  if (!videoTrack && !useNativeDetector.value) {
    const tracks = Quagga.CameraAccess.getActiveTrack();
    if (tracks) {
      videoTrack = tracks;
    }
  }

  if (videoTrack) {
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: !torchEnabled.value }] as any,
      });
      torchEnabled.value = !torchEnabled.value;
    } catch (error) {
      console.error('Error toggling torch:', error);
    }
  }
};

// Stop detection
const stopDetection = () => {
  if (detectionInterval) {
    clearInterval(detectionInterval);
    detectionInterval = null;
  }
  if (promptTimeout) {
    clearTimeout(promptTimeout);
    promptTimeout = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }
  if (!useNativeDetector.value) {
    try {
      if (quaggaDetectedHandler) {
        Quagga.offDetected(quaggaDetectedHandler);
        quaggaDetectedHandler = null;
      }
      Quagga.stop();
    } catch (e) {
      console.error('Error stopping Quagga:', e);
    }
  }
  // Ensure video element releases the stream reference
  if (videoElement.value) {
    try {
      videoElement.value.pause?.();
    } catch {}
    try {
      videoElement.value.srcObject = null;
    } catch {}
  }
  // Drop any cached track references and torch state
  videoTrack = null;
  torchEnabled.value = false;
};

// Trigger photo capture
const triggerPhotoCapture = () => {
  fileInput.value?.click();
};

// Handle photo capture
const handlePhotoCapture = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = async (e) => {
      if (!e.target?.result) return;
      img.src = e.target.result as string;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Try native BarcodeDetector first
      if (checkNativeBarcodeDetector()) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: [
              'ean_13',
              'ean_8',
              'upc_a',
              'upc_e',
              'code_128',
              'code_39',
            ],
          });
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            scannedCode.value = barcodes[0].rawValue;
            stopDetection();
            emit('detected', barcodes[0].rawValue);
            return;
          }
        } catch (error) {
          console.error('Native barcode detection from photo failed:', error);
        }
      }

      // Fallback to Quagga for photo processing
      Quagga.decodeSingle(
        {
          src: e.target.result as string,
          numOfWorkers: 0,
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'upc_reader',
              'upc_e_reader',
              'code_128_reader',
              'code_39_reader',
            ],
          },
          locate: true,
        },
        (result: any) => {
          if (result && result.codeResult) {
            scannedCode.value = result.codeResult.code;
            stopDetection();
            emit('detected', result.codeResult.code);
          } else {
            alert(
              'Could not detect barcode in photo. Please try again with better lighting.'
            );
          }
        }
      );
    };

    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Error processing photo:', error);
    alert('Error processing photo. Please try again.');
  }
};

const handleClose = () => {
  stopDetection();
  emit('close');
};

onMounted(async () => {
  // Check for native BarcodeDetector support
  if (checkNativeBarcodeDetector()) {
    useNativeDetector.value = true;
    await startNativeDetection();
  } else {
    useNativeDetector.value = false;
    await startQuaggaDetection();
  }

  // Show photo prompt after 5 seconds if no barcode detected
  promptTimeout = setTimeout(() => {
    if (!scannedCode.value) {
      showPhotoPrompt.value = true;
    }
  }, 5000);
});

onUnmounted(() => {
  stopDetection();
});
</script>

<style scoped>
.fade-slide-up-enter-active,
.fade-slide-up-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-up-enter-from,
.fade-slide-up-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
.fade-slide-up-enter-to,
.fade-slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}
</style>
