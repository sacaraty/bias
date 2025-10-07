import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import SidePanel from '../components/SidePanel';
import { CATEGORIES, categoryColor } from '../components/categories';

const Graph = dynamic(() => import('../components/Graph'), { ssr: false });

export default function Home() {
  const [biases, setBiases] = useState([]);
  const [selectedBiasId, setSelectedBiasId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set(CATEGORIES.map(c => c.key)));
  const graphRef = useRef(null);

  const biasById = useMemo(() => {
    const map = new Map();
    for (const b of biases) map.set(b.id, b);
    return map;
  }, [biases]);

  useEffect(() => {
    fetch('/data/biases.json')
      .then((res) => res.json())
      .then((data) => setBiases(data))
      .catch((err) => {
        console.error('Failed to load biases.json', err);
      });
  }, []);

  const selectedBias = selectedBiasId ? biasById.get(selectedBiasId) : null;

  // Filter by selected categories
  const filteredBiases = useMemo(() => {
    if (!biases || selectedCategories.size === CATEGORIES.length) return biases;
    return biases.filter((b) => selectedCategories.has(b.category));
  }, [biases, selectedCategories]);

  const handleNodeSelected = (biasId) => {
    setSelectedBiasId(biasId);
    setIsMobilePanelOpen(true);
  };

  const handleSelectRelated = (biasId) => {
    setSelectedBiasId(biasId);
    if (graphRef.current && graphRef.current.focusNode) {
      graphRef.current.focusNode(biasId);
    }
    setIsMobilePanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsMobilePanelOpen(false);
  };

  const handleClearSelection = () => {
    setSelectedBiasId(null);
    setIsMobilePanelOpen(false);
  };

  return (
    <>
      <Head>
        <title>Cognitive Bias Network Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold">Cognitive Bias Network</h1>
            <div className="text-xs sm:text-sm text-slate-500">Built with Cytoscape.js, Tailwind, Framer Motion</div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-0 sm:px-4 py-4 flex flex-col gap-4">
            {/* Filters row at top */}
            <div className="w-full rounded-xl border border-slate-200 bg-white p-3 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max">
                {CATEGORIES.map((cat) => {
                  const checked = selectedCategories.has(cat.key);
                  return (
                    <label key={cat.slug} htmlFor={`top-cat-${cat.slug}`} className="text-sm inline-flex items-center gap-2 cursor-pointer">
                      <input
                        id={`top-cat-${cat.slug}`}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedCategories((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(cat.key); else next.delete(cat.key);
                            if (next.size === 0) return new Set([cat.key]);
                            return next;
                          });
                        }}
                      />
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor(cat.key) }} />
                      {cat.key}
                    </label>
                  );
                })}
              </div>
            </div>

            <section className="relative flex-1 min-h-[70vh] lg:min-h-[82vh]">
              <Graph
                ref={graphRef}
                biases={filteredBiases}
                selectedBiasId={selectedBiasId}
                onSelectBias={handleNodeSelected}
                onClearSelection={handleClearSelection}
                onPanelStateChange={(open) => setIsMobilePanelOpen(open)}
              />
            </section>
          </div>
        </main>

        <AnimatePresence>
          {selectedBias && isMobilePanelOpen && (
            <SidePanel
              bias={selectedBias}
              onClose={handleClosePanel}
              onSelectRelated={handleSelectRelated}
              isMobile={true}
            />
          )}
        </AnimatePresence>

        <footer className="border-t border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-3 text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2">
            <span>Categories:</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#2563eb]" />Self &amp; Ego</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#16a34a]" />Social Arena</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]" />Decision Desert</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#ef4444]" />Memory Jungle</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#9333ea]" />Reality Rift</span>
          </div>
        </footer>
      </div>
    </>
  );
}
