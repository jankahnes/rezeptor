import formidable from 'formidable';
import { serverSupabaseClient } from '#supabase/server';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default defineEventHandler(async (event) => {
  const form = formidable({ multiples: false });
  const [fields, files] = await form.parse(event.node.req);

  const file = files.image?.[0];
  const bucket = fields.bucket?.[0];
  const id = fields.id?.[0];
  const isUpdate = fields.isUpdate?.[0] === 'true';

  if (!file || !bucket || !id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
  }

  const fileBuffer = await fs.readFile(file.filepath);
  
  let processedBuffer;
  let fileName;
  
  try {
    const sharp = await import('sharp').then(m => m.default);
    processedBuffer = await sharp(fileBuffer).webp({ quality: 75 }).toBuffer();
    fileName = `${id}.webp`;
  } catch (error: any) {
    console.warn('Sharp processing failed, using original file:', error.message);
    processedBuffer = fileBuffer;
    fileName = `${id}.${file.mimetype?.split('/')[1] || 'jpg'}`;
  }

  const client = await serverSupabaseClient(event);

  const { error } = await client.storage.from(bucket).upload(fileName, processedBuffer, {
    contentType: fileName.endsWith('.webp') ? 'image/webp' : file.mimetype || 'image/jpeg',
    upsert: isUpdate,
    cacheControl: '3600',
  });

  if (error) {
    console.error('Supabase upload error:', error.message);
    throw createError({ statusCode: 500, statusMessage: 'Supabase upload failed' });
  }

  const { data } = client.storage.from(bucket).getPublicUrl(fileName);
  return { success: true, publicUrl: data.publicUrl };
});