// Repliz API Service for Instagram Publishing
// Docs: POST /public/schedule - Create scheduled post
// Carousel → type: "album" with multiple medias

import { uploadMultipleImages, type CloudinaryUploadResult } from './cloudinary';

const REPLIZ_API_BASE = 'https://api.repliz.com';

export interface ReplizConfig {
  accessKey: string;
  secretKey: string;
  accountId: string;
}

export interface ReplizMedia {
  alt?: string;
  customThumbnail?: boolean;
  type: 'image' | 'video';
  thumbnail?: string;
  url: string;
}

export interface PublishToInstagramParams {
  images: string[];  // Array of image URLs for carousel
  caption: string;
  scheduleAt?: string;  // ISO date string, default: now
  isDraft?: boolean;
  uploadToCloud?: boolean;  // Upload to Cloudinary first for public URLs
}

export interface PublishResult {
  success: boolean;
  scheduleId?: string;
  url?: string;
  error?: string;
  cloudinaryResults?: CloudinaryUploadResult[];
}

// Get Repliz config from environment
function getConfig(): ReplizConfig {
  return {
    accessKey: import.meta.env.VITE_REPLIZ_ACCESS_KEY || '',
    secretKey: import.meta.env.VITE_REPLIZ_SECRET_KEY || '',
    accountId: import.meta.env.VITE_REPLIZ_ACCOUNT_ID || '',
  };
}

// Check if Repliz is configured
export function isReplizConfigured(): boolean {
  const config = getConfig();
  return !!(config.accessKey && config.secretKey && config.accountId);
}

// Publish carousel/album to Instagram via Repliz
// Uses Vercel API proxy to avoid CORS issues
export async function publishToInstagram(params: PublishToInstagramParams): Promise<PublishResult> {
  const config = getConfig();
  
  if (!config.accessKey || !config.secretKey) {
    return { success: false, error: 'Repliz credentials not configured. Add VITE_REPLIZ_ACCESS_KEY and VITE_REPLIZ_SECRET_KEY to .env.local' };
  }
  if (!config.accountId) {
    return { success: false, error: 'Repliz account ID not configured. Add VITE_REPLIZ_ACCOUNT_ID to .env.local' };
  }
  if (!params.images || params.images.length === 0) {
    return { success: false, error: 'No images provided' };
  }

  try {
    let imageUrls = params.images;
    let cloudinaryResults: CloudinaryUploadResult[] | undefined;

    // Upload to Cloudinary first if requested (for public URLs)
    if (params.uploadToCloud !== false) {
      const imagesToUpload = params.images.map((data, index) => ({
        data,
        name: `slide_${index + 1}_${Date.now()}`,
      }));
      cloudinaryResults = await uploadMultipleImages(imagesToUpload);
      imageUrls = cloudinaryResults.map(r => r.secure_url);
    }

    // Call Vercel API proxy instead of Repliz directly (avoids CORS)
    const proxyUrl = typeof window !== 'undefined' 
      ? '/api/publish' 
      : `${import.meta.env.VITE_SITE_URL || 'https://saham-fyp.vercel.app'}/api/publish`;

    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cloudinaryUrls: imageUrls,
        caption: params.caption,
        platform: 'instagram',
        scheduleAt: params.scheduleAt || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Publish error: ${response.status} - ${error}`, cloudinaryResults };
    }

    const data = await response.json();
    
    if (data.error) {
      return { success: false, error: data.error, cloudinaryResults };
    }

    return {
      success: true,
      scheduleId: data.scheduleId,
      url: data.url,
      cloudinaryResults,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to publish: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Publish single image (for backward compatibility)
export async function publishSingleImage(params: { imageUrl: string; caption: string }): Promise<PublishResult> {
  return publishToInstagram({
    images: [params.imageUrl],
    caption: params.caption,
  });
}

// Get connected accounts (placeholder - endpoint may differ)
export async function getReplizAccounts(): Promise<Array<{ id: string; username: string }>> {
  const config = getConfig();
  
  if (!config.accessKey || !config.secretKey) {
    return [];
  }

  try {
    const response = await fetch(`${REPLIZ_API_BASE}/public/accounts`, {
      headers: {
        'X-Access-Key': config.accessKey,
        'X-Secret-Key': config.secretKey,
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.accounts || data.data || [];
  } catch {
    return [];
  }
}
// ================= SCHEDULE STATUS & MANAGEMENT =================

export interface ScheduleStatusResult {
  success: boolean;
  status?: 'scheduled' | 'published' | 'failed' | 'cancelled';
  scheduleId?: string;
  publishedUrl?: string;
  error?: string;
}

// Fetch status of a scheduled post from Repliz
// NOTE: Endpoint di-estimate — adjust berdasarkan dokumentasi Repliz resmi
export async function getScheduleStatus(scheduleId: string): Promise<ScheduleStatusResult> {
  const config = getConfig();

  if (!config.accessKey || !config.secretKey) {
    return { success: false, error: 'Repliz credentials not configured' };
  }

  try {
    const response = await fetch(`${REPLIZ_API_BASE}/public/schedule/${scheduleId}`, {
      headers: {
        'X-Access-Key': config.accessKey,
        'X-Secret-Key': config.secretKey,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Repliz API error: ${response.status} - ${error}` };
    }

    const data = await response.json();
    return {
      success: true,
      status: data.status || data.state || 'scheduled',
      scheduleId: data.scheduleId || data.id || scheduleId,
      publishedUrl: data.url || data.permalink,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to fetch schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

// Cancel a scheduled post
// NOTE: Endpoint di-estimate — adjust berdasarkan dokumentasi Repliz resmi
export async function cancelSchedule(scheduleId: string): Promise<ScheduleStatusResult> {
  const config = getConfig();

  if (!config.accessKey || !config.secretKey) {
    return { success: false, error: 'Repliz credentials not configured' };
  }

  try {
    const response = await fetch(`${REPLIZ_API_BASE}/public/schedule/${scheduleId}/cancel`, {
      method: 'POST',
      headers: {
        'X-Access-Key': config.accessKey,
        'X-Secret-Key': config.secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scheduleId }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Repliz API error: ${response.status} - ${error}` };
    }

    return {
      success: true,
      status: 'cancelled',
      scheduleId,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to cancel schedule: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}