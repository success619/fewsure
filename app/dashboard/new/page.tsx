'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/lib/supabase-client';
import { Loader2, ImagePlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewDealPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  
  // UX State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate on mount
  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
      else router.push('/login');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const uploadedImageUrls: string[] = [];

      // Upload Images iteratively to the 'deals' bucket
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${userId}/deal-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error: uploadError } = await supabaseClient.storage
            .from('deals')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabaseClient.storage.from('deals').getPublicUrl(filePath);
          uploadedImageUrls.push(data.publicUrl);
        }
      }

      // Insert record into database
      const { error: dbError } = await supabaseClient
        .from('deals')
        .insert({
          user_id: userId,
          title,
          description,
          price: Number(price),
          image_urls: uploadedImageUrls,
        });

      if (dbError) throw dbError;

      //Clear cache and redirect
      router.refresh(); // CRITICAL: Forces the dashboard to show the new post
      router.push('/dashboard');
      
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('An unexpected error occurred during upload.');
      setLoading(false); // Only stop loading if error (otherwise let redirect handle it)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 text-gray-900">
      <div className="max-w-2xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1">Property Title</label>
              <input 
                type="text" 
                required 
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Modern Duplex in Lekki"
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-black"
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-1">Price ($)</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-black"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1">Property Images</label>
                <label className="w-full border border-gray-300 rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-50 transition text-gray-600">
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-sm">{files.length > 0 ? `${files.length} selected` : 'Browse files'}</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea 
                required 
                rows={4}
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the property features..."
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:border-black resize-none"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white py-3.5 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publish Deal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}