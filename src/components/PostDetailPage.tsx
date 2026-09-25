import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { automationPostsApi, generatedPostsApi, type AutomationPost, type GeneratedPost } from '../services/supabase';
import PostDetailView from './PostDetailView';
import Breadcrumbs from './Breadcrumbs';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<AutomationPost | GeneratedPost | null>(null);
  const [postType, setPostType] = useState<'automation' | 'manual'>('automation');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPost(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try finding in automation_posts
      try {
        const autoPost = await automationPostsApi.getById(postId);
        if (autoPost) {
          setPost(autoPost);
          setPostType('automation');
          return;
        }
      } catch (err) {
        console.warn('automationPostsApi.getById lookup warning:', err);
      }

      // 2. Try finding in generated_posts
      try {
        const manualPost = await generatedPostsApi.getById(postId);
        if (manualPost) {
          setPost(manualPost);
          setPostType('manual');
          return;
        }
      } catch (err) {
        console.warn('generatedPostsApi.getById lookup warning:', err);
      }

      setError('Postingan tidak ditemukan.');
    } catch (e: any) {
      console.error('loadPost error:', e);
      setError(e.message || 'Gagal memuat detail postingan.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="animate-spin w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full" />
        <p className="text-zinc-400 font-medium text-sm">Memuat detail postingan carousel...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto mt-16 bg-[#130a17] rounded-2xl border border-[#251323]">
        <span className="text-4xl block">🗂️</span>
        <h2 className="text-xl font-bold text-white">Post Tidak Ditemukan</h2>
        <p className="text-xs text-zinc-400">{error || 'Data postingan tidak tersedia.'}</p>
        <button
          onClick={() => navigate('/post')}
          className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition cursor-pointer"
        >
          Kembali ke Daftar Post
        </button>
      </div>
    );
  }

  return (
    <PostDetailView
      post={post}
      type={postType}
      onBack={() => navigate('/post')}
      onPostUpdated={() => id && loadPost(id)}
    />
  );
}
