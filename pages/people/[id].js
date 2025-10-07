import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';

export default function PersonPage() {
  const router = useRouter();
  const { id } = router.query;
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetch('/data/people.json')
      .then((r) => r.json())
      .then(setPeople)
      .catch(() => setPeople([]));
  }, []);

  const person = useMemo(() => people.find((p) => p.id === id), [people, id]);

  if (!id) return null;

  return (
    <>
      <Head>
        <title>{person ? `${person.name} — Researcher` : 'Researcher'} | Cognitive Bias Network</title>
      </Head>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-sm text-slate-500 hover:text-slate-700">← Back</a>
            <h1 className="text-lg sm:text-xl font-semibold">Researcher</h1>
            <div />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">
          {!person ? (
            <div className="text-slate-600">Loading…</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <section className="md:col-span-1 space-y-4">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <img src={person.photo} alt={`${person.name} photo`} className="w-full h-auto" />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h2 className="text-base font-semibold mb-2">{person.name}</h2>
                  <ul className="text-sm space-y-1">
                    <li><span className="text-slate-500">Profession:</span> {person.profession}</li>
                    <li><span className="text-slate-500">Country:</span> {person.country}</li>
                    <li><span className="text-slate-500">Birthplace:</span> {person.birthPlace}</li>
                    <li><span className="text-slate-500">Born:</span> {person.birthDate || '—'}</li>
                    <li><span className="text-slate-500">Died:</span> {person.deathDate || '—'}</li>
                  </ul>
                </div>
                {Array.isArray(person.links) && person.links.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h3 className="text-sm font-semibold mb-2">Links</h3>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      {person.links.map((l, i) => (
                        <li key={i}><a className="text-sky-600 hover:underline" href={l.url} target="_blank" rel="noreferrer">{l.title}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              <section className="md:col-span-2 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h2 className="text-base font-semibold mb-4">Life & Work Overview</h2>
                  {/* Simple infographic-like breakdown using cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <InfoCard label="Born" value={person.birthDate || '—'} />
                    <InfoCard label="Died" value={person.deathDate || '—'} />
                    <InfoCard label="Country" value={person.country || '—'} />
                    <InfoCard label="Birthplace" value={person.birthPlace || '—'} />
                    <InfoCard label="Profession" value={person.profession || '—'} />
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h2 className="text-base font-semibold mb-2">Signature Achievement</h2>
                  <p className="text-sm text-slate-800">{person.achievements}</p>
                </div>

                {Array.isArray(person.biases) && person.biases.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <h2 className="text-base font-semibold mb-2">Related Biases</h2>
                    <ul className="flex flex-wrap gap-2">
                      {person.biases.map((b) => (
                        <li key={b}><a href={`/#${b}`} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50">{b}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

