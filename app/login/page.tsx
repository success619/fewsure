import { createClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SubmitButton } from '@/components/ui/submit-button';
import { ErrorModal } from '@/components/ui/error-modal';

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;

  async function signIn(formData: FormData) {
    'use server';
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      redirect(`/login?error=${error.message}`);
    }
    
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* Reusable Modal intercepts the error if it exists */}
      <ErrorModal error={searchParams?.error} />

      <form action={signIn} className="w-full max-w-sm bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 text-center">Welcome Back</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">Sign in to your Fewsure account</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input name="email" type="email" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black" />
          </div>
        </div>

        {/* Reusable Button handles the loading state automatically */}
        <SubmitButton label="Log In" />

        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </form>
    </div>
  );
}