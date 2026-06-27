'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

type Props = {
  user: User;
  worldRegions: WorldRegion[];
  countries: Country[];
  regions: Region[];
  cities: City[];
  beaches: Beach[];
};

type WorldRegion = { id: string; name: string; slug: string; emoji: string; sort_order: number };
type Country     = { id: string; world_region_id: string; name: string; slug: string; flag_emoji: string; description: string | null };
type Region      = { id: string; country_id: string; name: string; slug: string; description: string | null };
type City        = { id: string; region_id: string; country_id: string; name: string; slug: string; latitude: number; longitude: number; description: string | null };
type Beach       = { id: string; city_id: string; name: string; slug: string; latitude: number; longitude: number; blue_flag: boolean; blue_flag_year: number | null; description: string | null; water_quality: string | null; facilities: string[] };

type Tab = 'world_regions' | 'countries' | 'regions' | 'cities' | 'beaches';

function slugify(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminDashboard({ user, worldRegions, countries, regions, cities, beaches }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('beaches');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // Beach form state
  const [beachForm, setBeachForm] = useState({
    city_id: '', name: '', slug: '', latitude: '', longitude: '',
    blue_flag: false, blue_flag_year: '', description: '', water_quality: '', facilities: '',
  });

  // Country form
  const [countryForm, setCountryForm] = useState({
    world_region_id: '', name: '', slug: '', flag_emoji: '🏳️', description: '',
  });

  // Region form
  const [regionForm, setRegionForm] = useState({
    country_id: '', name: '', slug: '', description: '',
  });

  // City form
  const [cityForm, setCityForm] = useState({
    region_id: '', country_id: '', name: '', slug: '', latitude: '', longitude: '', description: '',
  });

  async function logout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function showMsg(text: string) {
    setMsg(text);
    setTimeout(() => setMsg(''), 3000);
  }

  async function saveBeach() {
    setSaving(true);
    const { error } = await supabase.from('beaches').insert({
      city_id: beachForm.city_id,
      name: beachForm.name,
      slug: beachForm.slug || slugify(beachForm.name),
      latitude: parseFloat(beachForm.latitude),
      longitude: parseFloat(beachForm.longitude),
      blue_flag: beachForm.blue_flag,
      blue_flag_year: beachForm.blue_flag_year ? parseInt(beachForm.blue_flag_year) : null,
      description: beachForm.description || null,
      water_quality: beachForm.water_quality || null,
      facilities: beachForm.facilities ? beachForm.facilities.split(',').map(f => f.trim()) : [],
    });
    setSaving(false);
    if (error) { showMsg('❌ Eroare: ' + error.message); return; }
    showMsg('✅ Plajă adăugată!');
    setBeachForm({ city_id: '', name: '', slug: '', latitude: '', longitude: '', blue_flag: false, blue_flag_year: '', description: '', water_quality: '', facilities: '' });
    router.refresh();
  }

  async function saveCountry() {
    setSaving(true);
    const { error } = await supabase.from('countries').insert({
      world_region_id: countryForm.world_region_id,
      name: countryForm.name,
      slug: countryForm.slug || slugify(countryForm.name),
      flag_emoji: countryForm.flag_emoji,
      description: countryForm.description || null,
    });
    setSaving(false);
    if (error) { showMsg('❌ Eroare: ' + error.message); return; }
    showMsg('✅ Țară adăugată!');
    router.refresh();
  }

  async function saveRegion() {
    setSaving(true);
    const { error } = await supabase.from('regions').insert({
      country_id: regionForm.country_id,
      name: regionForm.name,
      slug: regionForm.slug || slugify(regionForm.name),
      description: regionForm.description || null,
    });
    setSaving(false);
    if (error) { showMsg('❌ Eroare: ' + error.message); return; }
    showMsg('✅ Regiune adăugată!');
    router.refresh();
  }

  async function saveCity() {
    setSaving(true);
    const { error } = await supabase.from('cities').insert({
      region_id: cityForm.region_id,
      country_id: cityForm.country_id,
      name: cityForm.name,
      slug: cityForm.slug || slugify(cityForm.name),
      latitude: parseFloat(cityForm.latitude),
      longitude: parseFloat(cityForm.longitude),
      description: cityForm.description || null,
    });
    setSaving(false);
    if (error) { showMsg('❌ Eroare: ' + error.message); return; }
    showMsg('✅ Oraș adăugat!');
    router.refresh();
  }

  async function deleteItem(table: string, id: string) {
    if (!confirm('Ești sigur că vrei să ștergi?')) return;
    await supabase.from(table).delete().eq('id', id);
    showMsg('🗑️ Șters.');
    router.refresh();
  }

  const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";
  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'beaches',      label: 'Plaje',         emoji: '🏖️' },
    { key: 'cities',       label: 'Orașe',          emoji: '🏙️' },
    { key: 'regions',      label: 'Regiuni țară',  emoji: '🗺️' },
    { key: 'countries',    label: 'Țări',           emoji: '🏳️' },
    { key: 'world_regions',label: 'Regiuni mondiale', emoji: '🌍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-gradient-to-r from-teal-700 to-cyan-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌊</span>
          <div>
            <h1 className="text-white font-bold">BeachMap Admin</h1>
            <p className="text-cyan-200 text-xs">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-cyan-200 hover:text-white text-sm transition-colors">
            ← Site public
          </a>
          <button onClick={logout} className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full transition-all">
            Deconectare
          </button>
        </div>
      </header>

      {/* Mesaj feedback */}
      {msg && (
        <div className="bg-teal-50 border-b border-teal-200 px-6 py-3 text-teal-800 text-sm font-medium">
          {msg}
        </div>
      )}

      {/* Statistici rapide */}
      <div className="px-6 py-4 grid grid-cols-5 gap-3">
        {[
          { label: 'Regiuni mondiale', count: worldRegions.length, emoji: '🌍' },
          { label: 'Țări',            count: countries.length,     emoji: '🏳️' },
          { label: 'Regiuni',         count: regions.length,       emoji: '🗺️' },
          { label: 'Orașe',           count: cities.length,        emoji: '🏙️' },
          { label: 'Plaje',           count: beaches.length,       emoji: '🏖️' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <div className="text-2xl">{s.emoji}</div>
            <div className="text-2xl font-bold text-gray-800 mt-1">{s.count}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-teal-600 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-teal-50 border border-gray-200'
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─── FORM PANEL ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

            {/* BEACH FORM */}
            {activeTab === 'beaches' && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-800">Adaugă plajă nouă</h2>
                <div>
                  <label className={labelCls}>Oraș *</label>
                  <select value={beachForm.city_id} onChange={e => setBeachForm({...beachForm, city_id: e.target.value})} className={inputCls}>
                    <option value="">Alege orașul</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Numele plajei *</label>
                  <input value={beachForm.name} onChange={e => setBeachForm({...beachForm, name: e.target.value, slug: slugify(e.target.value)})} placeholder="ex: Plaja Mamaia Nord" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Latitudine *</label>
                    <input type="number" step="0.0001" value={beachForm.latitude} onChange={e => setBeachForm({...beachForm, latitude: e.target.value})} placeholder="44.2700" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Longitudine *</label>
                    <input type="number" step="0.0001" value={beachForm.longitude} onChange={e => setBeachForm({...beachForm, longitude: e.target.value})} placeholder="28.6400" className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="bf" checked={beachForm.blue_flag} onChange={e => setBeachForm({...beachForm, blue_flag: e.target.checked})} className="rounded text-blue-600 w-4 h-4" />
                  <label htmlFor="bf" className="text-sm text-gray-700">🔵 Certificare Blue Flag</label>
                  {beachForm.blue_flag && (
                    <input type="number" value={beachForm.blue_flag_year} onChange={e => setBeachForm({...beachForm, blue_flag_year: e.target.value})} placeholder="2024" className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-teal-400" />
                  )}
                </div>
                <div>
                  <label className={labelCls}>Calitate apă</label>
                  <select value={beachForm.water_quality} onChange={e => setBeachForm({...beachForm, water_quality: e.target.value})} className={inputCls}>
                    <option value="">Selectează</option>
                    <option value="excellent">⭐ Excelentă</option>
                    <option value="good">✅ Bună</option>
                    <option value="fair">⚠️ Acceptabilă</option>
                    <option value="poor">❌ Slabă</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Facilități (separate prin virgulă)</label>
                  <input value={beachForm.facilities} onChange={e => setBeachForm({...beachForm, facilities: e.target.value})} placeholder="dusuri, vestiare, salvamar, umbrele" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Descriere</label>
                  <textarea value={beachForm.description} onChange={e => setBeachForm({...beachForm, description: e.target.value})} placeholder="Descriere scurtă..." className={inputCls + ' h-20 resize-none'} />
                </div>
                <button onClick={saveBeach} disabled={saving || !beachForm.name || !beachForm.city_id} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-40">
                  {saving ? 'Se salvează...' : '+ Adaugă plajă'}
                </button>
              </div>
            )}

            {/* COUNTRY FORM */}
            {activeTab === 'countries' && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-800">Adaugă țară nouă</h2>
                <div>
                  <label className={labelCls}>Regiune mondială *</label>
                  <select value={countryForm.world_region_id} onChange={e => setCountryForm({...countryForm, world_region_id: e.target.value})} className={inputCls}>
                    <option value="">Alege regiunea</option>
                    {worldRegions.map(r => <option key={r.id} value={r.id}>{r.emoji} {r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Numele țării *</label>
                  <input value={countryForm.name} onChange={e => setCountryForm({...countryForm, name: e.target.value, slug: slugify(e.target.value)})} placeholder="ex: Grecia" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Emoji steag</label>
                  <input value={countryForm.flag_emoji} onChange={e => setCountryForm({...countryForm, flag_emoji: e.target.value})} placeholder="🇬🇷" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Descriere</label>
                  <textarea value={countryForm.description} onChange={e => setCountryForm({...countryForm, description: e.target.value})} className={inputCls + ' h-20 resize-none'} />
                </div>
                <button onClick={saveCountry} disabled={saving || !countryForm.name || !countryForm.world_region_id} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-40">
                  {saving ? 'Se salvează...' : '+ Adaugă țară'}
                </button>
              </div>
            )}

            {/* REGION FORM */}
            {activeTab === 'regions' && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-800">Adaugă regiune / județ</h2>
                <div>
                  <label className={labelCls}>Țară *</label>
                  <select value={regionForm.country_id} onChange={e => setRegionForm({...regionForm, country_id: e.target.value})} className={inputCls}>
                    <option value="">Alege țara</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.flag_emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Numele regiunii *</label>
                  <input value={regionForm.name} onChange={e => setRegionForm({...regionForm, name: e.target.value, slug: slugify(e.target.value)})} placeholder="ex: Dobrogea" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Descriere</label>
                  <textarea value={regionForm.description} onChange={e => setRegionForm({...regionForm, description: e.target.value})} className={inputCls + ' h-20 resize-none'} />
                </div>
                <button onClick={saveRegion} disabled={saving || !regionForm.name || !regionForm.country_id} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-40">
                  {saving ? 'Se salvează...' : '+ Adaugă regiune'}
                </button>
              </div>
            )}

            {/* CITY FORM */}
            {activeTab === 'cities' && (
              <div className="space-y-4">
                <h2 className="font-bold text-gray-800">Adaugă oraș / stațiune</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Țară *</label>
                    <select value={cityForm.country_id} onChange={e => setCityForm({...cityForm, country_id: e.target.value})} className={inputCls}>
                      <option value="">Alege</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.flag_emoji} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Regiune *</label>
                    <select value={cityForm.region_id} onChange={e => setCityForm({...cityForm, region_id: e.target.value})} className={inputCls}>
                      <option value="">Alege</option>
                      {regions.filter(r => r.country_id === cityForm.country_id).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Numele orașului *</label>
                  <input value={cityForm.name} onChange={e => setCityForm({...cityForm, name: e.target.value, slug: slugify(e.target.value)})} placeholder="ex: Mamaia" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Latitudine *</label>
                    <input type="number" step="0.0001" value={cityForm.latitude} onChange={e => setCityForm({...cityForm, latitude: e.target.value})} placeholder="44.2536" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Longitudine *</label>
                    <input type="number" step="0.0001" value={cityForm.longitude} onChange={e => setCityForm({...cityForm, longitude: e.target.value})} placeholder="28.6386" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Descriere</label>
                  <textarea value={cityForm.description} onChange={e => setCityForm({...cityForm, description: e.target.value})} className={inputCls + ' h-20 resize-none'} />
                </div>
                <button onClick={saveCity} disabled={saving || !cityForm.name || !cityForm.region_id} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-xl transition-all disabled:opacity-40">
                  {saving ? 'Se salvează...' : '+ Adaugă oraș'}
                </button>
              </div>
            )}

            {activeTab === 'world_regions' && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">🌍</p>
                <p className="text-sm">Regiunile mondiale sunt presetate (Europa, Asia, etc.).</p>
                <p className="text-xs mt-2">Le poți edita direct din <strong>Supabase → Table Editor</strong>.</p>
              </div>
            )}
          </div>

          {/* ─── LIST PANEL ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4">
              {tabs.find(t => t.key === activeTab)?.emoji} {tabs.find(t => t.key === activeTab)?.label} existente
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">

              {activeTab === 'beaches' && beaches.map(b => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <span className="font-medium text-sm text-gray-800">{b.name}</span>
                    {b.blue_flag && <span className="ml-2 text-xs text-blue-600">🔵 BF {b.blue_flag_year}</span>}
                  </div>
                  <button onClick={() => deleteItem('beaches', b.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-all">
                    Șterge
                  </button>
                </div>
              ))}

              {activeTab === 'countries' && countries.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-medium text-sm text-gray-800">{c.flag_emoji} {c.name}</span>
                  <button onClick={() => deleteItem('countries', c.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-all">Șterge</button>
                </div>
              ))}

              {activeTab === 'regions' && regions.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-medium text-sm text-gray-800">{r.name}</span>
                  <button onClick={() => deleteItem('regions', r.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-all">Șterge</button>
                </div>
              ))}

              {activeTab === 'cities' && cities.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-medium text-sm text-gray-800">🏙️ {c.name}</span>
                  <button onClick={() => deleteItem('cities', c.id)} className="text-red-400 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 transition-all">Șterge</button>
                </div>
              ))}

              {activeTab === 'world_regions' && worldRegions.map(r => (
                <div key={r.id} className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="font-medium text-sm text-gray-800">{r.emoji} {r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
