// Media Library Page - Cloudinary + Supabase Integration
import React, { useState, useEffect } from 'react';
import { supabase, postImagesApi, type PostImage } from '../services/supabase';

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  size: number;
  createdAt: string;
  slideNumber: number;
  templateType: string;
}

export default function MediaLibrary() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [storageUsed, setStorageUsed] = useState(0);

  useEffect(() => { fetchMedia(); }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data: posts, error } = await supabase
        .from('generated_posts')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      const allImages: MediaItem[] = [];
      let totalSize = 0;
      
      for (const post of posts || []) {
        const images = await postImagesApi.getByPostId(post.id);
        for (const img of images as PostImage[]) {
          allImages.push({
            id: img.id,
            url: img.cloudinary_url,
            publicId: img.cloudinary_public_id || '',
            size: img.file_size || 0,
            createdAt: img.created_at,
            slideNumber: img.slide_number,
            templateType: img.template_type,
          });
          totalSize += img.file_size || 0;
        }
      }
      
      setMedia(allImages);
      setStorageUsed(totalSize);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
    if (bytes >= 1000) return (bytes / 1000).toFixed(1) + ' KB';
    return bytes + ' B';
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('URL copied!');
  };

  const storageLimit = 2 * 1000 * 1000 * 1000;
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🖼️ Media Library</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola gambar dari Cloudinary</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMedia} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">🔄 Refresh</button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Storage Used</p>
            <p className="text-lg font-bold text-slate-800">{formatSize(storageUsed)} / 2 GB</p>
          </div>
          <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${storagePercent}%` }} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <span className="text-4xl block mb-4">⏳</span>
          <p className="text-slate-500">Memuat data...</p>
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-slate-200 text-center">
          <span className="text-4xl block mb-4">📭</span>
          <p className="text-slate-500">Belum ada media yang diupload</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map(item => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-amber-500 transition">
              <img src={item.url} alt="" className="w-full h-full object-cover" onClick={() => copyToClipboard(item.url)} />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1">
                {item.templateType} - Slide {item.slideNumber}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}