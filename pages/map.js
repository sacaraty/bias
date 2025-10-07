import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function MapPage() {
  const [biases, setBiases] = useState([]);

  useEffect(() => {
    fetch('/data/biases.json').then((r) => r.json()).then(setBiases).catch(() => setBiases([]));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.L) return; // wait for leaflet from CDN
    const map = window.L.map('leaflet-map').setView([20, 0], 2);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    biases.forEach((b) => {
      if (!b.location || !Array.isArray(b.location.coords)) return;
      const [lat, lng] = b.location.coords;
      const label = `${b.name} (${b.year || 'n/a'})`;
      const popup = `<strong>${label}</strong><div>${b.location.place || ''}</div>`;
      window.L.marker([lat, lng]).addTo(map).bindPopup(popup);
    });
    return () => { map.remove(); };
  }, [biases]);

  return (
    <>
      <Head>
        <title>Map | Cognitive Bias Network</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossOrigin=""></script>
      </Head>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">Discovery Map</h1>
        <p className="text-sm text-slate-600 mb-4">Pins show approximate locations where each bias was first identified or publicized.</p>
        <div id="leaflet-map" className="h-[70vh] w-full rounded-xl border border-slate-200" />
      </div>
    </>
  );
}

