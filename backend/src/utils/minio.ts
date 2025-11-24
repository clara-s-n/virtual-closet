import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKETS = {
  BODY_IMAGES: 'body-images',
  GARMENTS: 'garments',
  TRY_ON_RESULTS: 'try-on-results',
};

export async function initializeMinIO() {
  for (const bucket of Object.values(BUCKETS)) {
    const exists = await minioClient.bucketExists(bucket);
    if (!exists) {
      await minioClient.makeBucket(bucket, 'us-east-1');
      console.log(`Bucket ${bucket} created successfully`);
    }
  }
}

export async function uploadFile(
  bucket: string,
  fileName: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<string> {
  const presignedUrlExpiry = parseInt(process.env.MINIO_PRESIGNED_URL_EXPIRY || '604800'); // Default: 7 days
  
  await minioClient.putObject(bucket, fileName, fileBuffer, fileBuffer.length, {
    'Content-Type': contentType,
  });

  const url = await minioClient.presignedGetObject(bucket, fileName, presignedUrlExpiry);
  return url;
}

export async function getFileUrl(bucket: string, fileName: string): Promise<string> {
  const presignedUrlExpiry = parseInt(process.env.MINIO_PRESIGNED_URL_EXPIRY || '604800'); // Default: 7 days
  return await minioClient.presignedGetObject(bucket, fileName, presignedUrlExpiry);
}

export { minioClient, BUCKETS };
