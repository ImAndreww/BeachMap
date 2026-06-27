import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BeachMap from '@/components/BeachMap';

export default async function CityPage({
  params,
}: {
  params: Promise<{ worldRegion: string; country: string; region: string; city: string }>;
}) {
  const { worldRegion: wrSlug, country: countrySlug, region: regionSlug, city: citySlug } = await params;
  const supabase = await createClient();

  const { data: city } = await supabase
    .from('cities')
    .select('*, regions(name, slug, countries(name, slug, flag_emoji, world_regions(name, slug)))')
    .eq('slug', citySlug)
    .single();

  if (!city) notFound();

  const { data: beaches } = await supabase
    .from('beaches')
    .select('*')
    .eq('city_id', city.id)
    .order('name');

  const region = city.regions as { name: string; slug: string; countries: { name: string; slug: string; flag_emoji: string; world_regions: { name: string; slug: string } } };
  const country = region.countries;
  const wr = country.world_regions;

  const blueFlagBeaches = beaches?.filter((b) => b.blue_flag) || [];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-cyan-600 px-6 py-4">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/explore/${wrSlug}/${countrySlug}/${regionSlug}`} className="text-white/70 hover:text-white text-sm transition-colors">
            ← {region.name}
          </Link>
        </div>
        <nav className="flex items-center gap-2 text-sm text-white/70 flex-wrap">
          <Link href="/" className="hover:text-white">Acasă</Link>
          <span>›</span>
          <Link href={`/explore/${wrSlug}`} className="hover:text-white">{wr.name}</Link>
          <span>›</span>
          <Link href={`/explore/${wrSlug}/${countrySlug}`} className="hover:text-white">{country.name}</Link>
          <span>›</span>
          <Link href={`/explore/${wrSlug}/${countrySlug}/${regionSlug}`} className="hover:text-white">{region.name}</Link>
          <span>›</span>
          <span className="text-white font-medium">{city.name}</span>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Titlu oraș */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🏖️ {city.name}</h1>
          <p className="text-gray-500 mt-1">{country.flag_emoji} {country.name} · {region.name}</p>
          {city.description && (
            <p className="text-gray-600 mt-2 text-sm max-w-2xl">{city.description}</p>
          )}
          <div className="flex gap-4 mt-3">
            <span className="text-sm text-gray-500">
              <strong className="text-gray-800">{beaches?.length || 0}</strong> plaje
            </span>
            <span className="text-sm text-blue-700">
              🔵 <strong>{blueFlagBeaches.length}</strong> certificare Blue Flag
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Harta Google Maps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow overflow-hidden border border-gray-100">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-700 text-sm">Hartă interactivă</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> Blue Flag
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span> Fără certificare
                  </span>
                </div>
              </div>
              <BeachMap
                apiKey={apiKey}
                centerLat={city.latitude}
                centerLng={city.longitude}
                beaches={beaches || []}
              />
            </div>
          </div>

          {/* Lista plaje */}
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
              Plaje ({beaches?.length || 0})
            </h2>
            {beaches?.map((beach) => (
              <div
                key={beach.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-teal-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-sm">{beach.name}</h3>
                  {beach.blue_flag ? (
                    <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      🔵 Blue Flag {beach.blue_flag_year}
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-50 text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      Fără BF
                    </span>
                  )}
                </div>

                {beach.description && (
                  <p className="text-xs text-gray-400 mb-2 line-clamp-2">{beach.description}</p>
                )}

                {beach.water_quality && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-gray-400">Calitate apă:</span>
                    <span className={`text-xs font-medium ${
                      beach.water_quality === 'excellent' ? 'text-green-600' :
                      beach.water_quality === 'good' ? 'text-teal-600' :
                      beach.water_quality === 'fair' ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {beach.water_quality === 'excellent' ? '⭐ Excelentă' :
                       beach.water_quality === 'good' ? '✅ Bună' :
                       beach.water_quality === 'fair' ? '⚠️ Acceptabilă' : '❌ Slabă'}
                    </span>
                  </div>
                )}

                {beach.facilities && beach.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {beach.facilities.slice(0, 4).map((f: string) => (
                      <span key={f} className="text-xs bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full border border-teal-100">
                        {f}
                      </span>
                    ))}
                    {beach.facilities.length > 4 && (
                      <span className="text-xs text-gray-400">+{beach.facilities.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(!beaches || beaches.length === 0) && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">🏗️</p>
                <p className="text-sm">Nicio plajă adăugată.</p>
                <Link href="/admin" className="text-teal-600 underline text-sm mt-1 inline-block">
                  Adaugă din Admin →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
