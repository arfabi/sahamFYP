const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  [key: string]: any;
}

export async function uploadToCloudinary(
  imageData: string, // base64 data URL atau blob URL
  fileName: string,
  folder = 'sahamfyp/carousel'
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary configuration missing');
  }

  const formData = new FormData();
  
  // Convert base64 to blob if needed
  if (imageData.startsWith('data:')) {
    const blob = await fetch(imageData).then(r => r.blob());
    formData.append('file', blob, fileName);
  } else {
    formData.append('file', imageData);
  }
  
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('public_id', fileName);
  formData.append('folder', folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cloudinary upload failed: ${error}`);
  }

  return response.json();
}

// Upload multiple images
export async function uploadMultipleImages(
  images: Array<{ data: string; name: string }>,
  folder = 'sahamfyp/carousel'
): Promise<CloudinaryUploadResult[]> {
  const results = await Promise.all(
    images.map(img => uploadToCloudinary(img.data, img.name, folder))
  );
  return results;
}

// Delete image from Cloudinary (requires API key, not recommended for client-side)
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  console.warn('Delete operation requires API key. Not recommended for client-side.');
  // Implementation would require server-side proxy
}
