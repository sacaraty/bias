import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { CATEGORIES, slugToCategory, categoryColor } from '../../components/categories';

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  const category = slugToCategory(String(slug || ''));
  const meta = CATEGORIES.find((c) => c.key === category);
  const [biases, setBiases] = useState([]);
  const [view, setView] = useState('chart'); // chart | grid | timeline | map

  useEffect(() => {
    fetch('/data/biases.json').then((r) => r.json()).then(setBiases).catch(() => setBiases([]));
  }, []);

  const list = useMemo(() => (biases || []).filter((b) => b.category === category), [biases, category]);

  return (
    <>
      <Head>
        <title>{category || 'Category'} | Cognitive Bias Network</title>
        {view === 'map' && (
          <>
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin=""></script>
          </>
        )}
      </Head>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: categoryColor(category) }} />
            {category}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{meta?.description}</p>
        </header>
        <div className="flex items-center gap-2 mb-4 text-sm">
          <button onClick={() => setView('chart')} className={`px-3 py-1.5 rounded-md border ${view==='chart'?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 border-slate-200'}`}>Interactive chart</button>
          <button onClick={() => setView('grid')} className={`px-3 py-1.5 rounded-md border ${view==='grid'?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 border-slate-200'}`}>Grid cards</button>
          <button onClick={() => setView('timeline')} className={`px-3 py-1.5 rounded-md border ${view==='timeline'?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 border-slate-200'}`}>Timeline</button>
          <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-md border ${view==='map'?'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 border-slate-200'}`}>Map</button>
        </div>

        {view === 'chart' && (
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600 mb-2">Use the main Home page for full interactivity. This view lists nodes for this category:</p>
            <ul className="flex flex-wrap gap-2">
              {list.map((b) => (
                <li key={b.id} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs" style={{ borderColor: categoryColor(b.category) }}>
                  <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: categoryColor(b.category) }} />
                  <a href={`/#${b.id}`} className="hover:underline">{b.name}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {view === 'grid' && (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((b) => (
              <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor(b.category) }} />
                  {b.name}
                </div>
                <div className="text-xs text-slate-600 mb-2">{b.funny_summary}</div>
                <a className="text-xs text-sky-600 hover:underline" href={`/#${b.id}`}>View in graph</a>
              </li>
            ))}
          </ul>
        )}

        {view === 'timeline' && (
          <ol className="relative border-l border-slate-200">
            {list.filter((b) => typeof b.year === 'number').sort((a, b) => a.year - b.year).map((it) => (
              <li key={it.id} className="ml-4 mb-6">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: categoryColor(it.category) }} />
                <time className="text-xs text-slate-500">{it.year}</time>
                <div className="text-sm font-medium">
                  <a href={`/#${it.id}`} className="hover:underline">{it.name}</a>
                </div>
              </li>
            ))}
          </ol>
        )}

        {view === 'map' && (
          <div id="leaflet-map" className="h-[70vh] w-full rounded-xl border border-slate-200" />
        )}
      </div>
      {view === 'map' && <LeafletPins items={list} />}
    </>
  );
}

function LeafletPins({ items }) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;
    const map = window.L.map('leaflet-map').setView([20, 0], 2);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    items.forEach((b) => {
      if (!b.location || !Array.isArray(b.location.coords)) return;
      const [lat, lng] = b.location.coords;
      window.L.marker([lat, lng]).addTo(map).bindPopup(`<strong>${b.name}</strong><div>${b.location.place || ''}</div>`);
    });
    return () => map.remove();
  }, [items]);
  return null;
}


