import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CountryPage({
  params,
}: {
  params: Promise<{ worldRegion: string; country: string }>;
}) {
  const { worldRegion: worldRegionSlug, country: countrySlug } = await params;
  const supabase = await createClient();

  const { data: country } = await supabase
    .from('countries')
    .select('*, world_regions(name, slug, emoji)')
    .eq('slug', countrySlug)
    .single();

  if (!country) notFound();

  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .eq('country_id', country.id)
    .order('name');

  const wr = country.world_regions as { name: string; slug: string; emoji: string };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-700 to-sky-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4 border-b border-white/20">
        <Link href={`/explore/${worldRegionSlug}`} className="text-white/70 hover:text-white text-sm transition-colors">
          ← {wr.name}
        </Link>
        <span className="text-white/30">|</span>
        <nav className="flex items-center gap-2 text-sm text-white/70 flex-wrap">
          <Link href="/" className="hover:text-white">Acasă</Link>
          <span>›</span>
          <Link href={`/explore/${worldRegionSlug}`} className="hover:text-white">{wr.name}</Link>
          <span>›</span>
          <span className="text-white font-medium">{country.name}</span>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Titlu țară */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">{country.flag_emoji}</div>
          <h1 className="text-white text-3xl font-bold">{country.name}</h1>
          {country.description && (
            <p className="text-cyan-100 mt-3 max-w-xl mx-auto text-sm">{country.description}</p>
          )}
        </div>

        {/* Lista regiuni */}
        <h2 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4 text-center">
          Regiuni / Județe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions?.map((region) => (
            <Link
              key={region.id}
              href={`/explore/${worldRegionSlug}/${countrySlug}/${region.slug}`}
              className="group bg-white rounded-2xl p-5 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 border border-cyan-100 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-xl flex-shrink-0">
                🗺️
              </div>
              <div>
                <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors">
                  {region.name}
                </h3>
                {region.description && (
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{region.description}</p>
                )}
                <span className="text-teal-600 text-xs font-medium mt-1 inline-block">
                  Vezi orașele →
                </span>
              </div>
            </Link>
          ))}

          {(!regions || regions.length === 0) && (
            <div className="col-span-2 text-center py-16 text-white/60">
              <p className="text-2xl mb-2">🏗️</p>
              <p>Nicio regiune adăugată încă pentru {country.name}.</p>
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
