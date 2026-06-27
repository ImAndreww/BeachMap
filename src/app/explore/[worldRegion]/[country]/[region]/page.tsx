import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function RegionPage({
  params,
}: {
  params: Promise<{ worldRegion: string; country: string; region: string }>;
}) {
  const { worldRegion: wrSlug, country: countrySlug, region: regionSlug } = await params;
  const supabase = await createClient();

  const { data: region } = await supabase
    .from('regions')
    .select('*, countries(name, slug, flag_emoji, world_regions(name, slug))')
    .eq('slug', regionSlug)
    .single();

  if (!region) notFound();

  const { data: cities } = await supabase
    .from('cities')
    .select('*, beaches(id, blue_flag)')
    .eq('region_id', region.id)
    .order('name');

  const country = region.countries as { name: string; slug: string; flag_emoji: string; world_regions: { name: string; slug: string } };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-700 to-blue-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-4 border-b border-white/20">
        <Link href={`/explore/${wrSlug}/${countrySlug}`} className="text-white/70 hover:text-white text-sm transition-colors">
          ← {country.name}
        </Link>
        <span className="text-white/30">|</span>
        <nav className="flex items-center gap-2 text-sm text-white/70 flex-wrap">
          <Link href="/" className="hover:text-white">Acasă</Link>
          <span>›</span>
          <Link href={`/explore/${wrSlug}`} className="hover:text-white">{country.world_regions.name}</Link>
          <span>›</span>
          <Link href={`/explore/${wrSlug}/${countrySlug}`} className="hover:text-white">{country.name}</Link>
          <span>›</span>
          <span className="text-white font-medium">{region.name}</span>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🗺️</div>
          <h1 className="text-white text-3xl font-bold">{region.name}</h1>
          <p className="text-blue-100 mt-1">{country.flag_emoji} {country.name}</p>
          {region.description && (
            <p className="text-blue-200 mt-3 max-w-xl mx-auto text-sm">{region.description}</p>
          )}
        </div>

        <h2 className="text-white/80 text-sm font-semibold uppercase tracking-widest mb-4 text-center">
          Orașe și stațiuni cu plajă
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cities?.map((city) => {
            const beaches = city.beaches as { id: string; blue_flag: boolean }[];
            const blueFlagCount = beaches?.filter((b) => b.blue_flag).length || 0;
            const totalBeaches = beaches?.length || 0;

            return (
              <Link
                key={city.id}
                href={`/explore/${wrSlug}/${countrySlug}/${regionSlug}/${city.slug}`}
                className="group bg-white rounded-2xl p-5 shadow hover:shadow-lg transition-all hover:-translate-y-0.5 border border-blue-100"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-800 group-hover:text-teal-700 transition-colors text-lg">
                    🏖️ {city.name}
                  </h3>
                  {blueFlagCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ml-2">
                      🔵 {blueFlagCount} Blue Flag
                    </span>
                  )}
                </div>

                {city.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mb-3">{city.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {totalBeaches} {totalBeaches === 1 ? 'plajă' : 'plaje'}
                  </span>
                  <span className="text-teal-600 text-xs font-medium">
                    Vezi plajele →
                  </span>
                </div>
              </Link>
            );
          })}

          {(!cities || cities.length === 0) && (
            <div className="col-span-2 text-center py-16 text-white/60">
              <p className="text-2xl mb-2">🏗️</p>
              <p>Niciun oraș adăugat încă pentru {region.name}.</p>
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
