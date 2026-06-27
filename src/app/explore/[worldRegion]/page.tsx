import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function WorldRegionPage({
  params,
}: {
  params: Promise<{ worldRegion: string }>;
}) {
  const { worldRegion: worldRegionSlug } = await params;
  const supabase = await createClient();

  const { data: worldRegion } = await supabase
    .from('world_regions')
    .select('*')
    .eq('slug', worldRegionSlug)
    .single();

  if (!worldRegion) notFound();

  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .eq('world_region_id', worldRegion.id)
    .order('name');

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-700 to-cyan-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4 border-b border-white/20">
        <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
          ← Înapoi
        </Link>
        <span className="text-white/30">|</span>
        <nav className="flex items-center gap-2 text-sm text-white/70">
          <Link href="/" className="hover:text-white">Acasă</Link>
          <span>›</span>
          <span className="text-white font-medium">{worldRegion.name}</span>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Titlu regiune */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">{worldRegion.emoji}</div>
          <h1 className="text-white text-3xl font-bold">{worldRegion.name}</h1>
          <p className="text-cyan-200 mt-2">{countries?.length || 0} țări cu plaje</p>
        </div>

        {/* Lista țări */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {countries?.map((country) => (
            <Link
              key={country.id}
              href={`/explore/${worldRegionSlug}/${country.slug}`}
              className="group bg-white rounded-2xl p-5 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 border border-teal-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{country.flag_emoji}</span>
                <h2 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                  {country.name}
                </h2>
              </div>
              {country.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{country.description}</p>
              )}
              <div className="mt-3 text-teal-600 text-xs font-medium">
                Vezi regiunile →
              </div>
            </Link>
          ))}

          {(!countries || countries.length === 0) && (
            <div className="col-span-3 text-center py-16 text-white/60">
              <p className="text-2xl mb-2">🏗️</p>
              <p>Nicio țară adăugată încă pentru {worldRegion.name}.</p>
              <Link href="/admin" className="text-cyan-300 underline mt-2 inline-block">
                Adaugă din Admin →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
