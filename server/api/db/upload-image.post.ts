import formidable from 'formidable';
import { serverSupabaseClient } from '#supabase/server';
import fs from 'fs/promises';

// We'll handle parsing manually based on content type
export const config = {
  api: {
    bodyParser: false,
  },
};

async function downloadImageFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export default defineEventHandler(async (event) => {
  // Check if this is a JSON request (image_url) or form data (file upload)
  const contentType = getHeader(event, 'content-type') || '';
  
  let fileBuffer: Buffer;
  let bucket: string;
  let id: string;
  let originalMimetype: string | null = null;
  if (contentType.includes('application/json')) {
    // Handle image_url case
    const body = await readBody(event);
    
    if (!body.image || !body.bucket || !body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing fields (image, bucket, id)' });
    }

    bucket = body.bucket;
    id = body.id;

    try {
      fileBuffer = await downloadImageFromUrl(body.image);
      // Try to infer mimetype from URL extension
      const urlPath = new URL(body.image).pathname;
      const extension = urlPath.split('.').pop()?.toLowerCase();
      originalMimetype = extension ? `image/${extension}` : 'image/jpeg';
    } catch (error: any) {
      throw createError({ statusCode: 400, statusMessage: `Failed to download image: ${error.message}` });
    }
  } else {
    // Handle file upload case (existing functionality)
    const form = formidable({ multiples: false });
    const [fields, files] = await form.parse(event.node.req);

    const file = files.image?.[0];
    const bucketField = fields.bucket?.[0];
    const idField = fields.id?.[0];

    if (!file || !bucketField || !idField) {
      throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
    }

    bucket = bucketField;
    id = idField;
    fileBuffer = await fs.readFile(file.filepath);
    originalMimetype = file.mimetype || null;
  }
  
  let processedBuffer;
  let fileName;
  
  try {
    const sharp = await import('sharp').then(m => m.default);
    processedBuffer = await sharp(fileBuffer).webp({ quality: 75 }).toBuffer();
    fileName = `${id}.webp`;
  } catch (error: any) {
    console.warn('Sharp processing failed, using original file:', error.message);
    processedBuffer = fileBuffer;
    fileName = `${id}.${originalMimetype?.split('/')[1] || 'jpg'}`;
  }

  const client = await serverSupabaseClient(event);

  const { error } = await client.storage.from(bucket).upload(fileName, processedBuffer, {
    contentType: fileName.endsWith('.webp') ? 'image/webp' : originalMimetype || 'image/jpeg',
    upsert: true,
    cacheControl: '3600',
  });

  if (error) {
    console.error('Supabase upload error:', error.message);
    throw createError({ statusCode: 500, statusMessage: 'Supabase upload failed' });
  }

  const { data } = client.storage.from(bucket).getPublicUrl(fileName);
  return { success: true, publicUrl: data.publicUrl };
});