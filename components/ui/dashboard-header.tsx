'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { User, PlusCircle, Loader2, UploadCloud, X } from 'lucide-react';
import { supabaseClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Profile } from '@/types';

export function DashboardHeader({ profile, userId }: { profile: Profile | null; userId: string }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [file, setFile] = useState<File | null>(null);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = profile?.avatar_url;

      // Upload new image if selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabaseClient.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabaseClient.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }

      // Update Database
      const { error } = await supabaseClient
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl })
        .eq('id', userId);

      if (error) throw error;

      setIsModalOpen(false);
      router.refresh(); // Forces Next.js to fetch the new data instantly
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-w-4xl mx-auto mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Fewsure Deal Matrix</h1>
          <p className="text-xs md:text-sm text-gray-500">
            Welcome back, <span className="font-semibold text-gray-700">{profile?.full_name || 'Agent'}</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/new" 
            className="flex items-center gap-1.5 bg-black hover:bg-gray-800 text-white text-xs md:text-sm px-4 py-2 rounded-lg font-medium transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Post Deal</span>
          </Link>

          {/* Clickable Avatar Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 hover:ring-2 ring-blue-500 transition relative group"
            title="Edit Profile"
          >
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="Profile" width={40} height={40} className="object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <span className="text-white text-[10px] font-bold uppercase">Edit</span>
            </div>
          </button>
        </div>
      </header>

      {/* Profile Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Avatar (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition flex justify-center mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}