import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: regions } = await supabase
    .from('world_regions')
    .select('*')
    .order('sort_order');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #006064 0%, #0097a7 40%, #e0f7fa 100%)' }}>

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🌊</span>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">BeachMap</h1>
            <p className="text-cyan-200 text-xs mt-0.5">Descoperă plajele lumii</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="text-cyan-300 hover:text-white text-sm border border-cyan-400 hover:border-white px-4 py-1.5 rounded-full transition-all"
        >
          Admin ↗
        </Link>
      </header>

      {/* Hero */}
      <div className="text-center px-6 pt-8 pb-16">
        <h2 className="text-white text-4xl font-bold mb-3">
          Unde mergem la plajă?
        </h2>
        <p className="text-cyan-100 text-lg max-w-lg mx-auto">
          Alege o regiune a lumii și explorează țările, stațiunile și plajele — inclusiv certificările Blue Flag.
        </p>
      </div>

      {/* World Region Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {regions?.map((region) => (
            <Link
              key={region.id}
              href={`/explore/${region.slug}`}
              className="group bg-white/90 hover:bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-white/50"
            >
              <div className="text-5xl mb-3">{region.emoji}</div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-teal-700 transition-colors">
                {region.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Explorează →
              </p>
            </Link>
          ))}

          {/* Placeholder dacă nu sunt date încă */}
          {(!regions || regions.length === 0) && (
            ['Europa 🇪🇺', 'Asia 🌏', 'Africa 🌍', 'America 🌎', 'Oceania 🌊'].map((r) => (
              <div key={r} className="bg-white/60 rounded-2xl p-6 text-center animate-pulse">
                <div className="h-12 w-12 bg-teal-100 rounded-full mx-auto mb-3" />
                <div className="h-4 bg-teal-100 rounded mx-auto w-20" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
