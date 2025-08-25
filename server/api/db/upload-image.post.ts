import formidable from 'formidable';
import { serverSupabaseClient } from '#supabase/server';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseBase64Image(base64String: string): { buffer: Buffer; mimeType: string } {
  const dataUrlMatch = base64String.match(/^data:([^;]+);base64,(.+)$/);
  
  if (dataUrlMatch) {
    const [, mimeType, base64Data] = dataUrlMatch;
    return {
      buffer: Buffer.from(base64Data, 'base64'),
      mimeType: mimeType
    };
  }
  return {
    buffer: Buffer.from(base64String, 'base64'),
    mimeType: 'image/jpeg'
  };
}

export default defineEventHandler(async (event) => {
  // Check if this is a JSON request (base64 image) or form data (file upload)
  const contentType = getHeader(event, 'content-type') || '';
  
  let fileBuffer: Buffer;
  let bucket: string;
  let id: string;
  let originalMimetype: string | null = null;
  
  if (contentType.includes('application/json')) {
    // Handle base64 image case
    const body = await readBody(event);
    
    if (!body.image || !body.bucket || !body.id) {
      throw createError({ statusCode: 400, statusMessage: 'Missing fields (image, bucket, id)' });
    }

    bucket = body.bucket;
    id = body.id;

    try {
      const { buffer, mimeType } = parseBase64Image(body.image);
      fileBuffer = buffer;
      originalMimetype = mimeType;
    } catch (error: any) {
      throw createError({ statusCode: 400, statusMessage: `Failed to parse base64 image: ${error.message}` });
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