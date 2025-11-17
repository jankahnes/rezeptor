<template>
  <BarcodeScanner @detected="handleBarcodeDetected" @close="handleClose" />
</template>

<script setup lang="ts">
const route = useRoute();

function handleBarcodeDetected(barcode: string) {
  const redirect = route.query.redirect as string | undefined;
  if (redirect) {
    navigateTo(`${redirect}?barcode=${barcode}`);
  } else {
    navigateTo(`/product/${barcode}`);
  }
}

function handleClose() {
  // Navigate back if user closes without scanning
  navigateTo('/');
}
</script>