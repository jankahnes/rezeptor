export const usePictureUrl = (
  bucket: string,
  id: string | number,
  ext: string
) =>
  useLazyAsyncData(() =>
    $fetch('/api/db/picture-url', { params: { bucket, id, ext } })
  );
