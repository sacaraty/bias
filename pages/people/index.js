import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

export default function PeopleIndex() {
  const [people, setPeople] = useState([]);
  const sorted = useMemo(() => [...people].sort((a, b) => a.name.localeCompare(b.name)), [people]);

  useEffect(() => {
    fetch('/data/people.json').then((r) => r.json()).then(setPeople).catch(() => setPeople([]));
  }, []);

  return (
    <>
      <Head>
        <title>Researchers | Cognitive Bias Network</title>
      </Head>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-sm text-slate-500 hover:text-slate-700">← Back</a>
            <h1 className="text-lg sm:text-xl font-semibold">Researchers</h1>
            <div />
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map((p) => (
              <li key={p.id} className="rounded-xl border border-slate-200 bg-white p-4 hover:shadow">
                <a href={`/people/${p.id}`} className="block">
                  <div className="flex items-center gap-3">
                    <img src={p.photo} alt="" className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-slate-600">{p.profession}</div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </>
  );
}

