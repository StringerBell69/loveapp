import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Configure R2 client
const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

/**
 * Compress image before upload
 * Max width: 1200px, Quality: 80%
 */
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        // Calculate new dimensions (max 1200px width)
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          0.8 // 80% quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to R2
 * Returns public URL
 */
export async function uploadImageToR2(
  file: Blob,
  fileName: string,
  folder: string = "memories"
): Promise<string> {
  const key = `${folder}/${Date.now()}-${fileName}`;

  const buffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: Buffer.from(buffer),
    ContentType: "image/jpeg",
  });

  await R2.send(command);

  // Return public URL
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Delete image from R2
 */
export async function deleteImageFromR2(imageUrl: string): Promise<void> {
  // Extract key from URL
  const key = imageUrl.replace(`${PUBLIC_URL}/`, "");

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await R2.send(command);
}

/**
 * Generate unique filename
 */
export function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  const ext = originalName.split(".").pop() || "jpg";
  return `${timestamp}-${random}.${ext}`;
}
