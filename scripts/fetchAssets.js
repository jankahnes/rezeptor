import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);
const bucketName = 'rezeptor-resources';
const prefix = 'assets/'; // folder in bucket to download

const s3 = new S3Client({
  region: 'eu-north-1',
  credentials: {
    accessKeyId: process.env.NUXT_PRIVATE_AWS_KEY,
    secretAccessKey: process.env.NUXT_PRIVATE_AWS_SECRET_ACCESS_KEY,
  },
});

const localFolder = path.resolve('server/assets');

// Skip download if folder already exists
if (fs.existsSync(localFolder)) {
  console.log('server/assets already exists, skipping download.');
  process.exit(0);
}

// Ensure base folder exists
fs.mkdirSync(localFolder, { recursive: true });

async function downloadFile(Key) {
  const command = new GetObjectCommand({ Bucket: bucketName, Key });
  const data = await s3.send(command);

  // Remove the 'assets/' prefix from Key when writing locally
  const relativePath = Key.replace(`${prefix}`, '');
  const filePath = path.join(localFolder, relativePath);

  // Ensure subfolders exist
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await pipe(data.Body, fs.createWriteStream(filePath));
  console.log(`Downloaded: ${relativePath}`);
}

async function main() {
  let continuationToken = undefined;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });
    const response = await s3.send(listCommand);

    if (response.Contents) {
      for (const obj of response.Contents) {
        await downloadFile(obj.Key);
      }
    }

    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
