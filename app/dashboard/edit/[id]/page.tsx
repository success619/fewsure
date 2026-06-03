import { createClient } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EditDealForm from './EditDealForm';

type Params = Promise<{ id: string }>;

export default async function EditDealPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = await createClient();

  // Guard: Protect the route server-side
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch the layout data cleanly before render
  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!deal) notFound();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 text-gray-900">
      <main className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Edit Property Deal</h1>
            <p className="text-sm text-gray-500 mt-1">Update your listing details or remove it from the feed.</p>
          </div>

          {/* Pass data into the interactive client form */}
          <EditDealForm deal={deal} />
        </div>
      </main>
    </div>
  );
}