import removeInstructionFormatting from '~/utils/format/removeInstructionFormatting';

export default defineEventHandler(async (event) => {
  const base_recipe_information = await readBody(event);
  if (base_recipe_information.original_image_base64) {
    // Remove background from existing image
    try {
      // Convert base64 to blob
      const base64Data = base_recipe_information.original_image_base64.replace(
        /^data:image\/[a-z]+;base64,/,
        ''
      );
      const buffer = Buffer.from(base64Data, 'base64');

      // Create FormData with blob
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('file', blob, 'image.png');

      // Call remove-background endpoint
      const response = await fetch(
        'https://jk-api.onrender.com/remove-background',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        const processedImageBuffer = await response.arrayBuffer();
        const processedImageBase64 = `data:image/png;base64,${Buffer.from(
          processedImageBuffer
        ).toString('base64')}`;

        base_recipe_information.image_base64 = processedImageBase64;
      }
    } catch (error) {
      console.error('Failed to remove background:', error);
      // Continue with original image if background removal fails
    }
  } else {
    // Generate image from recipe data
    try {
      const imageGenerationData = {
        title: base_recipe_information.title,
        instructions: removeInstructionFormatting(base_recipe_information.instructions || []),
        collection: base_recipe_information?.collection || "user-generated"
      };
      const response = await fetch(
        'https://jk-api.onrender.com/generate-image-from-recipe-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(imageGenerationData),
        }
      );
      if (response.ok) {
        const generatedImageBuffer = await response.arrayBuffer();
        const generatedImageBase64 = `data:image/png;base64,${Buffer.from(
          generatedImageBuffer
        ).toString('base64')}`;
        base_recipe_information.image_base64 = generatedImageBase64;
      }
      else {
        console.error('Failed to generate image:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  }
  return base_recipe_information;
});
