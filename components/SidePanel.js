import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function SidePanel({ bias, onClose, onSelectRelated, isMobile }) {
  if (!isMobile) {
    return (
      <div className="sticky top-4 h-[calc(100vh-6rem)] overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {bias ? <PanelContent bias={bias} onSelectRelated={onSelectRelated} /> : <Placeholder />}
      </div>
    );
  }
  return (
    <AnimatePresence>
      {bias && (
        <motion.div className="fixed inset-x-0 bottom-0 z-50" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 28 }}>
          <div className="mx-auto max-w-7xl px-4 pb-safe">
            <div className="rounded-t-2xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="h-1.5 w-12 rounded-full bg-slate-300 mx-auto" />
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-base font-semibold">{bias.name}</h2>
                  <button onClick={onClose} className="ml-2 inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50">Close</button>
                </div>
                <PanelContent bias={bias} onSelectRelated={onSelectRelated} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Placeholder() {
  return (
    <div className="h-full grid place-items-center text-sm text-slate-500 p-6">Select a bias from the network to see details here.</div>
  );
}

function PanelContent({ bias, onSelectRelated }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Category</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor(bias.category) }} />
          {bias.category}
        </span>
      </div>
      {(bias.year || bias.discoverer) && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          {bias.year && (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
              Discovered: <span className="font-medium text-slate-800">{bias.year}</span>
            </span>
          )}
          {bias.discoverer && (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
              By: <span className="font-medium text-slate-800">{bias.discoverer}</span>
            </span>
          )}
        </div>
      )}
      {bias.name_origin && (
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Name origin</div>
          <p className="text-sm text-slate-800">{bias.name_origin}</p>
        </div>
      )}
      {bias.image && (
        <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
          <img src={bias.image} alt={`${bias.name} illustration`} className="w-full h-auto" />
        </div>
      )}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Funny summary</div>
        <p className="text-sm text-slate-800">{bias.funny_summary}</p>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">Description</div>
        <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">{bias.description}</p>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Related biases</div>
        {bias.related && bias.related.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {bias.related.map((rid) => (
              <li key={rid}>
                <button onClick={() => onSelectRelated(rid)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50" title="Focus on this related bias">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                  {rid}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">No related biases listed.</p>
        )}
      </div>
      {Array.isArray(bias.sources) && bias.sources.length > 0 && (
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Key sources</div>
          <ul className="list-disc pl-5 space-y-1">
            {bias.sources.slice(0, 3).map((s, idx) => (
              <li key={idx} className="text-sm">
                <a href={s.url} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">{s.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function categoryColor(category) {
  switch (category) {
    case 'Self & Ego': return '#2563eb';
    case 'Social Arena': return '#16a34a';
    case 'Decision Desert': return '#f59e0b';
    case 'Memory Jungle': return '#ef4444';
    case 'Reality Rift': return '#9333ea';
    default: return '#64748b';
  }
}
