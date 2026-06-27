import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Dacă nu ești logat, te trimitem la login
  if (!user) {
    redirect('/login');
  }

  // Încarcă toate datele pentru dashboard
  const [
    { data: worldRegions },
    { data: countries },
    { data: regions },
    { data: cities },
    { data: beaches },
  ] = await Promise.all([
    supabase.from('world_regions').select('*').order('sort_order'),
    supabase.from('countries').select('*').order('name'),
    supabase.from('regions').select('*').order('name'),
    supabase.from('cities').select('*').order('name'),
    supabase.from('beaches').select('*').order('name'),
  ]);

  return (
    <AdminDashboard
      user={user}
      worldRegions={worldRegions || []}
      countries={countries || []}
      regions={regions || []}
      cities={cities || []}
      beaches={beaches || []}
    />
  );
}
