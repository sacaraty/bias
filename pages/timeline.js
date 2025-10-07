import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';

export default function TimelinePage() {
  const [mode, setMode] = useState('biases'); // 'biases' | 'authors'
  const [biases, setBiases] = useState([]);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetch('/data/biases.json').then((r) => r.json()).then(setBiases).catch(() => setBiases([]));
    fetch('/data/people.json').then((r) => r.json()).then(setPeople).catch(() => setPeople([]));
  }, []);

  const items = useMemo(() => {
    if (mode === 'biases') {
      return biases
        .filter((b) => typeof b.year === 'number')
        .map((b) => ({ id: b.id, label: b.name, year: b.year, href: `/#${b.id}` }))
        .sort((a, b) => a.year - b.year);
    } else {
      return people
        .map((p) => ({ id: p.id, label: p.name, start: toYear(p.birthDate), end: toYear(p.deathDate), href: `/people/${p.id}` }))
        .filter((p) => p.start || p.end)
        .sort((a, b) => (a.start || 9999) - (b.start || 9999));
    }
  }, [mode, biases, people]);

  return (
    <>
      <Head>
        <title>Timeline | Cognitive Bias Network</title>
      </Head>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Timeline</h1>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setMode('biases')} className={`px-3 py-1.5 rounded-md border ${mode==='biases' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>Biases</button>
            <button onClick={() => setMode('authors')} className={`px-3 py-1.5 rounded-md border ${mode==='authors' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>Authors</button>
          </div>
        </div>

        {mode === 'biases' ? (
          <ol className="relative border-l border-slate-200">
            {items.map((it) => (
              <li key={it.id} className="ml-4 mb-6">
                <div className="absolute -left-1.5 mt-1 h-3 w-3 rounded-full bg-slate-400" />
                <time className="text-xs text-slate-500">{it.year}</time>
                <div>
                  <a href={it.href} className="text-sm font-medium text-slate-900 hover:underline">{it.label}</a>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <a key={it.id} href={it.href} className="block rounded-lg border border-slate-200 bg-white p-3 hover:shadow">
                <div className="text-sm font-semibold">{it.label}</div>
                <div className="text-xs text-slate-600">{formatSpan(it.start, it.end)}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function toYear(dateStr) {
  if (!dateStr) return undefined;
  const y = Number((dateStr || '').slice(0, 4));
  return Number.isFinite(y) ? y : undefined;
}

function formatSpan(a, b) {
  if (!a && !b) return '—';
  if (a && b) return `${a} – ${b}`;
  if (a) return `${a} –`;
  return `– ${b}`;
}

