export const useImageUpload = (
    file: File,
    bucket: string,
    id: string,
    isUpdate: boolean
  ) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('bucket', bucket);
    formData.append('id', id);
    formData.append('isUpdate', String(isUpdate));
  
    return useAsyncData('image-upload', () =>
      fetch('/api/db/upload-image', {
        method: 'POST',
        body: formData,
      }).then(res => res.json())
    );
  };