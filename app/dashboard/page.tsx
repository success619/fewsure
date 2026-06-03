export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase';
import { OnboardingModal } from '@/components/ui/onboarding-modal';
import { DealCard } from '@/components/ui/deal-card';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { Building2 } from 'lucide-react';
import Link from 'next/link';
import { Profile, Deal } from '@/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as unknown as { data: Profile | null };

  // PRO DEFENSIVE FIX: Prevents layout breaking if profile setup asynchronous lag happens
  const safeProfile: Profile = profile || {
    id: user.id,
    full_name: user.email?.split('@')[0] || 'Agent',
    avatar_url: null,
  };

  // PRO FIX: Pull the raw response components to monitor database health
  const response = await supabase
    .from('deals')
    .select(`
      id,
      title,
      description,
      price,
      image_urls,
      user_id,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `)
    .order('id', { ascending: false });

  const deals = response.data as Deal[] | null;
  const error = response.error;

  // If there's an active database/relationship error, print it clearly in your terminal console
  if (error) {
    console.error('--- SUPABASE DISCOVERY ERROR ---', {
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 text-gray-900">
      <OnboardingModal userId={user.id} />
      
      {/* Interactive client-header architecture consuming protected layout maps */}
      <DashboardHeader profile={safeProfile} userId={user.id} />

      <main className="max-w-xl mx-auto">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Live Property Feed</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-xs font-mono mb-6">
            <strong>Database Error ({error.code}):</strong> {error.message}
            {error.hint && <p className="mt-1 text-gray-500">Hint: {error.hint}</p>}
          </div>
        )}
        
        {(!deals || deals.length === 0) ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No active deals found</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              Be the first premium agent to broadcast an inventory listing to the feed network.
            </p>
            <Link 
              href="/dashboard/new" 
              className="inline-block mt-4 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              Create First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {deals.map((deal: Deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                currentUserId={user.id} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}