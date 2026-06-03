'use server';

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const deal_type = formData.get('deal_type') as string;

  await supabase.from('deals').insert([{ title, description, deal_type, user_id: user.id }]);
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function deleteDeal(id: string) {
  const supabase = await createClient();
  await supabase.from('deals').delete().eq('id', id);
  revalidatePath('/dashboard');
}

export async function logOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}