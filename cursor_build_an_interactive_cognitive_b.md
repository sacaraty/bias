# Build an interactive cognitive biases map
_Exported on 10/3/2025 at 17:12:40 GMT+2 from Cursor (1.5.11)_

---

**User**

You are my senior frontend engineer. 
I want to build a website in Next.js (React) that shows an interactive network map of cognitive biases (write it in the iopened folder)

Here is what I need:
- Use Cytoscape.js (or D3.js if better) to display nodes for each bias.
- Each bias is loaded from a JSON file with fields: id, name, category, funny_summary, description, related[].
- Nodes are color-coded by category (Self & Ego, Social Arena, Decision Desert, Memory Jungle, Reality Rift).
- Hovering a node shows a tooltip with the bias name + funny_summary.
- Clicking a node opens a side panel with the description and all related biases (clickable).
- Relationship lines between biases should be visible, and clicking one highlights both connected biases.
- Add smooth animations for hover and click using Framer Motion or GSAP.
- Make the design clean and modern using Tailwind CSS.
- Structure components so I can later add more features like search & filters.
- Make this responsive for desktop and mobile.
- Explain clearly in comments how each part works so I can expand it later.

Then:
1. Generate the full Next.js project setup with package.json dependencies.
2. Create a sample JSON dataset with 10 example biases and their relationships.
3. Implement the working interactive map, side panel, tooltips.
4. Include instructions to run locally on my machine.

Please output the final code in separate files (pages/index.js, components/Graph.js, components/SidePanel.js, public/data/biases.json, styles/tailwind.css) so I can paste directly into a Next.js project.

---

**Cursor**

I'll scaffold the Next.js project structure with Tailwind, data, and Cytoscape components, then wire up interactions and finalize instructions. Now I'll create the files in your workspace.

I created a task list and started scaffolding. Now I'll mark completed items and proceed to share the files and instructions.

### package.json
```json
{
  "name": "cognitive-bias-map",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "autoprefixer": "^10.4.18",
    "cytoscape": "^3.30.2",
    "cytoscape-popper": "^2.0.2",
    "framer-motion": "^11.3.17",
    "next": "^14.2.5",
    "postcss": "^8.4.41",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.10",
    "tippy.js": "^6.3.7"
  }
}
```

### pages/index.js
```javascript
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import SidePanel from '../components/SidePanel';

// Dynamically import Graph to avoid SSR issues with window usage
const Graph = dynamic(() => import('../components/Graph'), { ssr: false });

/**
 * This page:
 * - Loads biases JSON from /public/data/biases.json at runtime (client-side)
 * - Renders the Cytoscape-based graph and a side panel
 * - Coordinates selection state between the graph and the panel
 * 
 * Tailwind is used for layout and styling.
 * Framer Motion is used inside SidePanel for smooth slide-in/out animations.
 */
export default function Home() {
  const [biases, setBiases] = useState([]);
  const [selectedBiasId, setSelectedBiasId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const graphRef = useRef(null);

  // Convenience map for O(1) lookup by id
  const biasById = useMemo(() => {
    const map = new Map();
    for (const b of biases) map.set(b.id, b);
    return map;
  }, [biases]);

  // Load data once on mount
  useEffect(() => {
    // Bias data lives under /public so it is served at /data/biases.json
    fetch('/data/biases.json')
      .then((res) => res.json())
      .then((data) => setBiases(data))
      .catch((err) => {
        console.error('Failed to load biases.json', err);
      });
  }, []);

  // Current selected bias object for panel
  const selectedBias = selectedBiasId ? biasById.get(selectedBiasId) : null;

  // Called when a node is clicked in the graph
  const handleNodeSelected = (biasId) => {
    setSelectedBiasId(biasId);
    setIsMobilePanelOpen(true); // open drawer on mobile
  };

  // Called when a related bias is clicked in the side panel
  const handleSelectRelated = (biasId) => {
    setSelectedBiasId(biasId);
    // Ask the graph to focus/center the node
    if (graphRef.current && graphRef.current.focusNode) {
      graphRef.current.focusNode(biasId);
    }
    setIsMobilePanelOpen(true);
  };

  // Close side panel (mobile)
  const handleClosePanel = () => {
    setIsMobilePanelOpen(false);
  };

  // Clear selection when background clicked
  const handleClearSelection = () => {
    setSelectedBiasId(null);
    setIsMobilePanelOpen(false);
  };

  return (
    <>
      <Head>
        <title>Cognitive Bias Network Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Tip: add this import in pages/_app.js for tooltips styling:
             import 'tippy.js/dist/tippy.css'
             and also import Tailwind:
             import '../styles/tailwind.css'
        */}
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Cognitive Bias Network
            </h1>
            <div className="text-xs sm:text-sm text-slate-500">
              Built with Cytoscape.js, Tailwind, Framer Motion
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-0 sm:px-4 py-4 flex flex-col lg:flex-row gap-0 lg:gap-4">
            {/* Graph area */}
            <section className="relative flex-1 min-h-[60vh] lg:min-h-[80vh]">
              {/* Container for Cytoscape to mount into */}
              <Graph
                ref={graphRef}
                biases={biases}
                selectedBiasId={selectedBiasId}
                onSelectBias={handleNodeSelected}
                onClearSelection={handleClearSelection}
                onPanelStateChange={(open) => {
                  // When panel opens/closes, Cytoscape may need a resize
                  // The Graph component listens to this and resizes accordingly
                  setIsMobilePanelOpen(open);
                }}
              />
            </section>

            {/* Side panel: shown as a persistent column on desktop */}
            <aside className="hidden lg:block w-full lg:w-[380px] xl:w-[420px]">
              <SidePanel
                bias={selectedBias}
                onClose={() => {}}
                onSelectRelated={handleSelectRelated}
                isMobile={false}
              />
            </aside>
          </div>
        </main>

        {/* Mobile drawer panel */}
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

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-3 text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2">
            <span>Categories:</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2563eb]" />
              Self &amp; Ego
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
              Social Arena
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]" />
              Decision Desert
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#ef4444]" />
              Memory Jungle
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#9333ea]" />
              Reality Rift
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
```

### components/Graph.js
```javascript
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';

// Register popper extension once
if (typeof window !== 'undefined' && !cytoscape.prototype.popper) {
  cytoscape.use(popper);
}

// Category → color mapping (Tailwind palette approximations)
const CATEGORY_COLORS = {
  'Self & Ego': '#2563eb',       // blue-600
  'Social Arena': '#16a34a',     // green-600
  'Decision Desert': '#f59e0b',  // amber-500
  'Memory Jungle': '#ef4444',    // red-500
  'Reality Rift': '#9333ea'      // purple-600
};

/**
 * Build Cytoscape elements arrays from the biases data.
 * - Nodes: one per bias
 * - Edges: undirected, deduplicated using a sorted pair key
 */
function buildElements(biases) {
  const nodes = biases.map((b) => ({
    data: {
      id: b.id,
      label: b.name,
      category: b.category,
      funny: b.funny_summary
    }
  }));

  const seen = new Set();
  const edges = [];
  for (const b of biases) {
    for (const relId of b.related || []) {
      const a = b.id < relId ? b.id : relId;
      const c = b.id < relId ? relId : b.id;
      const key = `${a}__${c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        data: { id: `e_${a}_${c}`, source: a, target: c }
      });
    }
  }

  return { nodes, edges };
}

/**
 * Graph renders an interactive Cytoscape network:
 * - Hover node: shows tooltip with name + funny_summary
 * - Click node: highlights + calls onSelectBias
 * - Click edge: highlights edge and its two nodes
 * - Background click: clears selection
 * - Exposes focusNode(id) via ref to center/highlight a node
 * 
 * Animations:
 * - Smooth style transitions via Cytoscape 'transition-duration'
 * - Node tap animates zoom/centering, and style changes are animated
 */
const Graph = forwardRef(function Graph(
  {
    biases = [],
    selectedBiasId = null,
    onSelectBias = () => {},
    onClearSelection = () => {},
    onPanelStateChange = () => {}
  },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Expose imperative method to focus on a node id
  useImperativeHandle(ref, () => ({
    focusNode: (id) => {
      const cy = cyRef.current;
      if (!cy) return;
      const node = cy.$(`node[id = "${id}"]`);
      if (node.nonempty()) {
        clearHighlights(cy);
        node.addClass('selected');
        node.connectedEdges().addClass('edge-highlight');
        node.connectedNodes().addClass('neighbor');

        cy.animate({
          center: { eles: node },
          zoom: Math.min(1.2, Math.max(0.8, cy.zoom()))
        }, { duration: 450, easing: 'ease-in-out' });
      }
    }
  }));

  // Initialize Cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        // Base node style
        {
          selector: 'node',
          style: {
            'background-color': (ele) => CATEGORY_COLORS[ele.data('category')] || '#64748b',
            'label': 'data(label)',
            'color': '#1f2937',
            'font-size': '10px',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 26,
            'height': 26,
            'border-width': 2,
            'border-color': '#ffffff',
            'overlay-opacity': 0,
            'transition-property': 'background-color, width, height, border-width, line-color, opacity',
            'transition-duration': '250ms',
            'transition-timing-function': 'ease-in-out',
            'z-index': 1
          }
        },
        // Hovered node (we add/remove this class on mouseover)
        {
          selector: 'node.hovered',
          style: {
            'width': 34,
            'height': 34,
            'border-width': 3
          }
        },
        // Selected node (on click)
        {
          selector: 'node.selected',
          style: {
            'width': 38,
            'height': 38,
            'border-width': 3
          }
        },
        // Neighbor nodes of selected
        {
          selector: 'node.neighbor',
          style: {
            'opacity': 0.9
          }
        },
        // Base edge style
        {
          selector: 'edge',
          style: {
            'curve-style': 'unbundled-bezier',
            'control-point-distances': [20, -20],
            'opacity': 0.35,
            'line-color': '#94a3b8',
            'width': 2,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '250ms',
            'z-index': 0
          }
        },
        // Highlighted edge
        {
          selector: 'edge.edge-highlight',
          style: {
            'opacity': 0.9,
            'line-color': '#0ea5e9',
            'width': 3
          }
        },
        // De-emphasize everything when a selection exists
        {
          selector: 'node.dimmed',
          style: { 'opacity': 0.25 }
        },
        {
          selector: 'edge.dimmed',
          style: { 'opacity': 0.1 }
        }
      ],
      layout: {
        name: 'cose',
        fit: true,
        padding: 30,
        nodeOverlap: 8,
        nodeRepulsion: 8000,
        idealEdgeLength: 80
      },
      wheelSensitivity: 0.2,
      pixelRatio: 2
    });

    cyRef.current = cy;

    // Hover handlers: show tooltip and add hovered style
    const showTooltip = (evt) => {
      const node = evt.target;
      node.addClass('hovered');

      // Create a popper-based tooltip with tippy
      const ref = node.popperRef();
      const content = document.createElement('div');
      content.className = 'text-sm';
      const label = node.data('label');
      const funny = node.data('funny');
      content.innerHTML = `<strong>${label}</strong><div class="text-slate-600">${funny || ''}</div>`;

      // Store tippy instance on the node for reuse/cleanup
      const tip = tippy(document.createElement('div'), {
        getReferenceClientRect: ref.getBoundingClientRect,
        content,
        trigger: 'manual',
        interactive: false,
        placement: 'top',
        theme: 'light-border',
        hideOnClick: false
      });
      tip.show();
      node.scratch('_tip', tip);
    };

    const hideTooltip = (evt) => {
      const node = evt.target;
      node.removeClass('hovered');
      const tip = node.scratch('_tip');
      if (tip) {
        tip.destroy();
        node.removeScratch('_tip');
      }
    };

    cy.on('mouseover', 'node', showTooltip);
    cy.on('mouseout', 'node', hideTooltip);

    // Node click: highlight and notify parent
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const id = node.id();

      clearHighlights(cy);
      node.addClass('selected');
      node.connectedEdges().addClass('edge-highlight');
      node.connectedNodes().addClass('neighbor');

      // Dim non-neighbors for focus
      cy.nodes().not(node).not(node.connectedNodes()).addClass('dimmed');
      cy.edges().not(node.connectedEdges()).addClass('dimmed');

      // Smooth animation to center and slightly zoom
      cy.animate({
        center: { eles: node },
        zoom: Math.min(1.2, Math.max(0.8, cy.zoom()))
      }, { duration: 450, easing: 'ease-in-out' });

      onSelectBias(id);
      onPanelStateChange(true);
    });

    // Edge click: highlight both connected nodes and the edge
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      clearHighlights(cy);

      edge.addClass('edge-highlight');
      const ends = edge.connectedNodes();
      ends.addClass('neighbor');

      // Keep most items visible but slightly dimmed
      cy.nodes().not(ends).addClass('dimmed');
      cy.edges().not(edge).addClass('dimmed');

      onPanelStateChange(false); // do not force open panel on edge tap
    });

    // Background click: clear selection
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        clearHighlights(cy);
        onClearSelection();
        onPanelStateChange(false);
      }
    });

    // Resize Cytoscape when container/page changes
    const handleResize = () => {
      cy.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cy.destroy();
      cyRef.current = null;
    };
  }, [onClearSelection, onPanelStateChange, onSelectBias]);

  // When biases data changes, (re)load elements and layout
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const { nodes, edges } = buildElements(biases);
    cy.elements().remove();
    cy.add([...nodes, ...edges]);
    cy.layout({ name: 'cose', fit: true, padding: 30 }).run();

    // After re-layout, ensure a selected node (if any) is focused
    if (selectedBiasId) {
      const node = cy.$(`node[id = "${selectedBiasId}"]`);
      if (node.nonempty()) {
        cy.center(node);
        node.addClass('selected');
        node.connectedEdges().addClass('edge-highlight');
        node.connectedNodes().addClass('neighbor');
        cy.nodes().not(node).not(node.connectedNodes()).addClass('dimmed');
        cy.edges().not(node.connectedEdges()).addClass('dimmed');
      }
    }
  }, [biases, selectedBiasId]);

  return (
    <div className="absolute inset-0">
      {/* The Cytoscape canvas will mount into this element */}
      <div ref={containerRef} className="h-full w-full rounded-none lg:rounded-xl bg-white shadow-sm border border-slate-200" />
    </div>
  );
});

export default Graph;

// Utility: clear all highlight/dim classes and destroy any open tooltips
function clearHighlights(cy) {
  cy.nodes().forEach((n) => {
    const tip = n.scratch('_tip');
    if (tip) {
      tip.destroy();
      n.removeScratch('_tip');
    }
  });

  cy.nodes().removeClass('hovered selected neighbor dimmed');
  cy.edges().removeClass('edge-highlight dimmed');
}
```

### components/SidePanel.js
```javascript
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * SidePanel:
 * - Desktop: rendered in the right column, always present
 * - Mobile: rendered as a bottom sheet/drawer with slide animation
 * 
 * Props:
 * - bias: currently selected bias object (or null)
 * - onClose: close handler (used on mobile)
 * - onSelectRelated: callback for clicking a related bias id
 * - isMobile: toggles drawer mode and close button
 */
export default function SidePanel({ bias, onClose, onSelectRelated, isMobile }) {
  // Desktop static panel
  if (!isMobile) {
    return (
      <div className="sticky top-4 h-[calc(100vh-6rem)] overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {bias ? <PanelContent bias={bias} onSelectRelated={onSelectRelated} /> : <Placeholder />}
      </div>
    );
  }

  // Mobile drawer variant
  return (
    <AnimatePresence>
      {bias && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <div className="mx-auto max-w-7xl px-4 pb-safe">
            <div className="rounded-t-2xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="h-1.5 w-12 rounded-full bg-slate-300 mx-auto" />
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-base font-semibold">
                    {bias.name}
                  </h2>
                  <button
                    onClick={onClose}
                    className="ml-2 inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    Close
                  </button>
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
    <div className="h-full grid place-items-center text-sm text-slate-500 p-6">
      Select a bias from the network to see details here.
    </div>
  );
}

function PanelContent({ bias, onSelectRelated }) {
  return (
    <div className="space-y-4">
      {/* Category badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Category</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryColor(bias.category) }}
          />
          {bias.category}
        </span>
      </div>

      {/* Funny summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Funny summary
        </div>
        <p className="text-sm text-slate-800">
          {bias.funny_summary}
        </p>
      </div>

      {/* Description */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Description
        </div>
        <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">
          {bias.description}
        </p>
      </div>

      {/* Related biases */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Related biases
        </div>
        {bias.related && bias.related.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {bias.related.map((rid) => (
              <li key={rid}>
                <button
                  onClick={() => onSelectRelated(rid)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                  title="Focus on this related bias"
                >
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
    </div>
  );
}

function categoryColor(category) {
  switch (category) {
    case 'Self & Ego':
      return '#2563eb';
    case 'Social Arena':
      return '#16a34a';
    case 'Decision Desert':
      return '#f59e0b';
    case 'Memory Jungle':
      return '#ef4444';
    case 'Reality Rift':
      return '#9333ea';
    default:
      return '#64748b';
  }
}
```

### public/data/biases.json
```json
[
  {
    "id": "anchoring",
    "name": "Anchoring",
    "category": "Decision Desert",
    "funny_summary": "First number says it louder, your brain claps the hardest.",
    "description": "Anchoring is the tendency to rely too heavily on the first piece of information offered (the anchor) when making decisions. Adjustments away from the anchor are often insufficient.",
    "related": ["confirmation", "sunk_cost", "loss_aversion"]
  },
  {
    "id": "confirmation",
    "name": "Confirmation Bias",
    "category": "Reality Rift",
    "funny_summary": "Your beliefs hire only facts that agree with them.",
    "description": "Confirmation bias is the tendency to search for, interpret, favor, and recall information in a way that confirms one's preexisting beliefs or hypotheses.",
    "related": ["anchoring", "bandwagon", "negativity"]
  },
  {
    "id": "availability",
    "name": "Availability Heuristic",
    "category": "Memory Jungle",
    "funny_summary": "If it pops into mind fast, it must be true (says your brain).",
    "description": "People evaluate the likelihood of events based on how easily examples come to mind, which can be biased by recent exposure or vividness rather than actual probability.",
    "related": ["negativity", "hindsight", "loss_aversion"]
  },
  {
    "id": "hindsight",
    "name": "Hindsight Bias",
    "category": "Memory Jungle",
    "funny_summary": "\"I knew it all along\"—your memory, after the ending is revealed.",
    "description": "Hindsight bias is the tendency to see events as having been predictable after they have already occurred, distorting memory of prior uncertainty.",
    "related": ["availability", "confirmation"]
  },
  {
    "id": "dunning_kruger",
    "name": "Dunning–Kruger Effect",
    "category": "Self & Ego",
    "funny_summary": "Confidence climbs the hill long before competence catches up.",
    "description": "People with low ability at a task tend to overestimate their ability. High performers may underestimate their relative competence.",
    "related": ["fundamental_attribution", "bandwagon"]
  },
  {
    "id": "fundamental_attribution",
    "name": "Fundamental Attribution Error",
    "category": "Social Arena",
    "funny_summary": "Others trip because they're clumsy; you trip because the ground was sneaky.",
    "description": "The tendency to overemphasize personality-based explanations for others' behavior while underemphasizing situational explanations.",
    "related": ["dunning_kruger", "bandwagon"]
  },
  {
    "id": "bandwagon",
    "name": "Bandwagon Effect",
    "category": "Social Arena",
    "funny_summary": "If everyone's doing it, it must be brilliant (right?).",
    "description": "Adopting beliefs because many others hold them. Popularity itself becomes a signal of correctness, irrespective of evidence.",
    "related": ["confirmation", "fundamental_attribution", "dunning_kruger"]
  },
  {
    "id": "loss_aversion",
    "name": "Loss Aversion",
    "category": "Decision Desert",
    "funny_summary": "Losing $5 hurts more than finding $5 feels good.",
    "description": "Losses loom larger than gains. People prefer avoiding losses to acquiring equivalent gains, influencing risk-taking and choices.",
    "related": ["anchoring", "availability", "sunk_cost"]
  },
  {
    "id": "sunk_cost",
    "name": "Sunk Cost Fallacy",
    "category": "Decision Desert",
    "funny_summary": "Throwing good time after bad because you've already paid.",
    "description": "Continuing a behavior or endeavor as a result of previously invested resources (time, money, effort) even if the future costs outweigh the benefits.",
    "related": ["anchoring", "loss_aversion"]
  },
  {
    "id": "negativity",
    "name": "Negativity Bias",
    "category": "Reality Rift",
    "funny_summary": "Bad news yells; good news whispers.",
    "description": "Negative events and emotions have a greater psychological impact than neutral or positive ones, affecting memory, attention, and decision-making.",
    "related": ["availability", "confirmation"]
  }
]
```

### styles/tailwind.css
```css
/* Tailwind Directives (build-time) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Minimal modern base styles (optional enhancements) */
@layer base {
  html, body, #__next {
    height: 100%;
  }

  /* Smooth font rendering */
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Utilities for safe-area padding on iOS */
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Optional: tippy fallback if you don't import its CSS
   This provides basic tooltip styling in case the user
   didn't add `import 'tippy.js/dist/tippy.css'` to pages/_app.js */
.tippy-box[data-theme~='light-border'] {
  background-color: #fff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.tippy-box[data-theme~='light-border'] .tippy-content {
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.2;
}
```

### How to run locally
- Install Node 18+.
- Create a new Next.js app (or use your existing project). In the project root:
  - Add the files above into:
    - `pages/index.js`
    - `components/Graph.js`
    - `components/SidePanel.js`
    - `public/data/biases.json`
    - `styles/tailwind.css`
  - Create Tailwind config files:
    - `tailwind.config.js`:
      ```javascript
      /** @type {import('tailwindcss').Config} */
      module.exports = {
        content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
        theme: { extend: {} },
        plugins: []
      };
      ```
    - `postcss.config.js`:
      ```javascript
      module.exports = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {}
        }
      };
      ```
  - Ensure globals are imported in `pages/_app.js`:
    ```javascript
    import '../styles/tailwind.css';
    import 'tippy.js/dist/tippy.css'; // optional, for prettier tooltips
    export default function App({ Component, pageProps }) {
      return <Component {...pageProps} />;
    }
    ```
  - Replace or merge your `package.json` dependencies with the one above, then run:
    ```bash
    npm install
    npm run dev
    ```
- Open `http://localhost:3000` and interact with the network.
  - Hover a node for tooltip.
  - Click a node to open the side panel and highlight neighbors.
  - Click an edge to highlight its two endpoints.
  - On mobile, the panel slides up as a drawer.

- Notes for extending:
  - Search/filters: keep data in `pages/index.js`, then pass a filtered `biases` array into `Graph`. Rebuilding elements is already handled when `biases` changes.
  - Categories/colors: adjust `CATEGORY_COLORS` in `components/Graph.js`.
  - Tooltips: content is defined in `showTooltip` inside `Graph`.

- Responsive behavior:
  - Desktop: persistent right panel.
  - Mobile: sliding drawer using Framer Motion.

- Animations:
  - Node size/edge color transitions use Cytoscape style `transition-duration`.
  - Panel open/close uses Framer Motion spring transitions.

I finished creating all requested files and the app structure; paste them into your Next.js project and follow the run steps.

```json
{
  "name": "cognitive-bias-map",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "autoprefixer": "^10.4.18",
    "cytoscape": "^3.30.2",
    "cytoscape-popper": "^2.0.2",
    "framer-motion": "^11.3.17",
    "next": "^14.2.5",
    "postcss": "^8.4.41",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^3.4.10",
    "tippy.js": "^6.3.7"
  }
}
```

```javascript
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { AnimatePresence } from 'framer-motion';
import SidePanel from '../components/SidePanel';

// Dynamically import Graph to avoid SSR issues with window usage
const Graph = dynamic(() => import('../components/Graph'), { ssr: false });

/**
 * This page:
 * - Loads biases JSON from /public/data/biases.json at runtime (client-side)
 * - Renders the Cytoscape-based graph and a side panel
 * - Coordinates selection state between the graph and the panel
 * 
 * Tailwind is used for layout and styling.
 * Framer Motion is used inside SidePanel for smooth slide-in/out animations.
 */
export default function Home() {
  const [biases, setBiases] = useState([]);
  const [selectedBiasId, setSelectedBiasId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const graphRef = useRef(null);

  // Convenience map for O(1) lookup by id
  const biasById = useMemo(() => {
    const map = new Map();
    for (const b of biases) map.set(b.id, b);
    return map;
  }, [biases]);

  // Load data once on mount
  useEffect(() => {
    // Bias data lives under /public so it is served at /data/biases.json
    fetch('/data/biases.json')
      .then((res) => res.json())
      .then((data) => setBiases(data))
      .catch((err) => {
        console.error('Failed to load biases.json', err);
      });
  }, []);

  // Current selected bias object for panel
  const selectedBias = selectedBiasId ? biasById.get(selectedBiasId) : null;

  // Called when a node is clicked in the graph
  const handleNodeSelected = (biasId) => {
    setSelectedBiasId(biasId);
    setIsMobilePanelOpen(true); // open drawer on mobile
  };

  // Called when a related bias is clicked in the side panel
  const handleSelectRelated = (biasId) => {
    setSelectedBiasId(biasId);
    // Ask the graph to focus/center the node
    if (graphRef.current && graphRef.current.focusNode) {
      graphRef.current.focusNode(biasId);
    }
    setIsMobilePanelOpen(true);
  };

  // Close side panel (mobile)
  const handleClosePanel = () => {
    setIsMobilePanelOpen(false);
  };

  // Clear selection when background clicked
  const handleClearSelection = () => {
    setSelectedBiasId(null);
    setIsMobilePanelOpen(false);
  };

  return (
    <>
      <Head>
        <title>Cognitive Bias Network Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Tip: add this import in pages/_app.js for tooltips styling:
             import 'tippy.js/dist/tippy.css'
             and also import Tailwind:
             import '../styles/tailwind.css'
        */}
      </Head>

      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Cognitive Bias Network
            </h1>
            <div className="text-xs sm:text-sm text-slate-500">
              Built with Cytoscape.js, Tailwind, Framer Motion
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-0 sm:px-4 py-4 flex flex-col lg:flex-row gap-0 lg:gap-4">
            {/* Graph area */}
            <section className="relative flex-1 min-h-[60vh] lg:min-h-[80vh]">
              {/* Container for Cytoscape to mount into */}
              <Graph
                ref={graphRef}
                biases={biases}
                selectedBiasId={selectedBiasId}
                onSelectBias={handleNodeSelected}
                onClearSelection={handleClearSelection}
                onPanelStateChange={(open) => {
                  // When panel opens/closes, Cytoscape may need a resize
                  // The Graph component listens to this and resizes accordingly
                  setIsMobilePanelOpen(open);
                }}
              />
            </section>

            {/* Side panel: shown as a persistent column on desktop */}
            <aside className="hidden lg:block w-full lg:w-[380px] xl:w-[420px]">
              <SidePanel
                bias={selectedBias}
                onClose={() => {}}
                onSelectRelated={handleSelectRelated}
                isMobile={false}
              />
            </aside>
          </div>
        </main>

        {/* Mobile drawer panel */}
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

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="mx-auto max-w-7xl px-4 py-3 text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-2">
            <span>Categories:</span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#2563eb]" />
              Self &amp; Ego
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#16a34a]" />
              Social Arena
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]" />
              Decision Desert
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#ef4444]" />
              Memory Jungle
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-[#9333ea]" />
              Reality Rift
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
```

```javascript
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';

// Register popper extension once
if (typeof window !== 'undefined' && !cytoscape.prototype.popper) {
  cytoscape.use(popper);
}

// Category → color mapping (Tailwind palette approximations)
const CATEGORY_COLORS = {
  'Self & Ego': '#2563eb',       // blue-600
  'Social Arena': '#16a34a',     // green-600
  'Decision Desert': '#f59e0b',  // amber-500
  'Memory Jungle': '#ef4444',    // red-500
  'Reality Rift': '#9333ea'      // purple-600
};

/**
 * Build Cytoscape elements arrays from the biases data.
 * - Nodes: one per bias
 * - Edges: undirected, deduplicated using a sorted pair key
 */
function buildElements(biases) {
  const nodes = biases.map((b) => ({
    data: {
      id: b.id,
      label: b.name,
      category: b.category,
      funny: b.funny_summary
    }
  }));

  const seen = new Set();
  const edges = [];
  for (const b of biases) {
    for (const relId of b.related || []) {
      const a = b.id < relId ? b.id : relId;
      const c = b.id < relId ? relId : b.id;
      const key = `${a}__${c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        data: { id: `e_${a}_${c}`, source: a, target: c }
      });
    }
  }

  return { nodes, edges };
}

/**
 * Graph renders an interactive Cytoscape network:
 * - Hover node: shows tooltip with name + funny_summary
 * - Click node: highlights + calls onSelectBias
 * - Click edge: highlights edge and its two nodes
 * - Background click: clears selection
 * - Exposes focusNode(id) via ref to center/highlight a node
 * 
 * Animations:
 * - Smooth style transitions via Cytoscape 'transition-duration'
 * - Node tap animates zoom/centering, and style changes are animated
 */
const Graph = forwardRef(function Graph(
  {
    biases = [],
    selectedBiasId = null,
    onSelectBias = () => {},
    onClearSelection = () => {},
    onPanelStateChange = () => {}
  },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Expose imperative method to focus on a node id
  useImperativeHandle(ref, () => ({
    focusNode: (id) => {
      const cy = cyRef.current;
      if (!cy) return;
      const node = cy.$(`node[id = "${id}"]`);
      if (node.nonempty()) {
        clearHighlights(cy);
        node.addClass('selected');
        node.connectedEdges().addClass('edge-highlight');
        node.connectedNodes().addClass('neighbor');

        cy.animate({
          center: { eles: node },
          zoom: Math.min(1.2, Math.max(0.8, cy.zoom()))
        }, { duration: 450, easing: 'ease-in-out' });
      }
    }
  }));

  // Initialize Cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        // Base node style
        {
          selector: 'node',
          style: {
            'background-color': (ele) => CATEGORY_COLORS[ele.data('category')] || '#64748b',
            'label': 'data(label)',
            'color': '#1f2937',
            'font-size': '10px',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': 26,
            'height': 26,
            'border-width': 2,
            'border-color': '#ffffff',
            'overlay-opacity': 0,
            'transition-property': 'background-color, width, height, border-width, line-color, opacity',
            'transition-duration': '250ms',
            'transition-timing-function': 'ease-in-out',
            'z-index': 1
          }
        },
        // Hovered node (we add/remove this class on mouseover)
        {
          selector: 'node.hovered',
          style: {
            'width': 34,
            'height': 34,
            'border-width': 3
          }
        },
        // Selected node (on click)
        {
          selector: 'node.selected',
          style: {
            'width': 38,
            'height': 38,
            'border-width': 3
          }
        },
        // Neighbor nodes of selected
        {
          selector: 'node.neighbor',
          style: {
            'opacity': 0.9
          }
        },
        // Base edge style
        {
          selector: 'edge',
          style: {
            'curve-style': 'unbundled-bezier',
            'control-point-distances': [20, -20],
            'opacity': 0.35,
            'line-color': '#94a3b8',
            'width': 2,
            'transition-property': 'line-color, width, opacity',
            'transition-duration': '250ms',
            'z-index': 0
          }
        },
        // Highlighted edge
        {
          selector: 'edge.edge-highlight',
          style: {
            'opacity': 0.9,
            'line-color': '#0ea5e9',
            'width': 3
          }
        },
        // De-emphasize everything when a selection exists
        {
          selector: 'node.dimmed',
          style: { 'opacity': 0.25 }
        },
        {
          selector: 'edge.dimmed',
          style: { 'opacity': 0.1 }
        }
      ],
      layout: {
        name: 'cose',
        fit: true,
        padding: 30,
        nodeOverlap: 8,
        nodeRepulsion: 8000,
        idealEdgeLength: 80
      },
      wheelSensitivity: 0.2,
      pixelRatio: 2
    });

    cyRef.current = cy;

    // Hover handlers: show tooltip and add hovered style
    const showTooltip = (evt) => {
      const node = evt.target;
      node.addClass('hovered');

      // Create a popper-based tooltip with tippy
      const ref = node.popperRef();
      const content = document.createElement('div');
      content.className = 'text-sm';
      const label = node.data('label');
      const funny = node.data('funny');
      content.innerHTML = `<strong>${label}</strong><div class="text-slate-600">${funny || ''}</div>`;

      // Store tippy instance on the node for reuse/cleanup
      const tip = tippy(document.createElement('div'), {
        getReferenceClientRect: ref.getBoundingClientRect,
        content,
        trigger: 'manual',
        interactive: false,
        placement: 'top',
        theme: 'light-border',
        hideOnClick: false
      });
      tip.show();
      node.scratch('_tip', tip);
    };

    const hideTooltip = (evt) => {
      const node = evt.target;
      node.removeClass('hovered');
      const tip = node.scratch('_tip');
      if (tip) {
        tip.destroy();
        node.removeScratch('_tip');
      }
    };

    cy.on('mouseover', 'node', showTooltip);
    cy.on('mouseout', 'node', hideTooltip);

    // Node click: highlight and notify parent
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const id = node.id();

      clearHighlights(cy);
      node.addClass('selected');
      node.connectedEdges().addClass('edge-highlight');
      node.connectedNodes().addClass('neighbor');

      // Dim non-neighbors for focus
      cy.nodes().not(node).not(node.connectedNodes()).addClass('dimmed');
      cy.edges().not(node.connectedEdges()).addClass('dimmed');

      // Smooth animation to center and slightly zoom
      cy.animate({
        center: { eles: node },
        zoom: Math.min(1.2, Math.max(0.8, cy.zoom()))
      }, { duration: 450, easing: 'ease-in-out' });

      onSelectBias(id);
      onPanelStateChange(true);
    });

    // Edge click: highlight both connected nodes and the edge
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      clearHighlights(cy);

      edge.addClass('edge-highlight');
      const ends = edge.connectedNodes();
      ends.addClass('neighbor');

      // Keep most items visible but slightly dimmed
      cy.nodes().not(ends).addClass('dimmed');
      cy.edges().not(edge).addClass('dimmed');

      onPanelStateChange(false); // do not force open panel on edge tap
    });

    // Background click: clear selection
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        clearHighlights(cy);
        onClearSelection();
        onPanelStateChange(false);
      }
    });

    // Resize Cytoscape when container/page changes
    const handleResize = () => {
      cy.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cy.destroy();
      cyRef.current = null;
    };
  }, [onClearSelection, onPanelStateChange, onSelectBias]);

  // When biases data changes, (re)load elements and layout
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const { nodes, edges } = buildElements(biases);
    cy.elements().remove();
    cy.add([...nodes, ...edges]);
    cy.layout({ name: 'cose', fit: true, padding: 30 }).run();

    // After re-layout, ensure a selected node (if any) is focused
    if (selectedBiasId) {
      const node = cy.$(`node[id = "${selectedBiasId}"]`);
      if (node.nonempty()) {
        cy.center(node);
        node.addClass('selected');
        node.connectedEdges().addClass('edge-highlight');
        node.connectedNodes().addClass('neighbor');
        cy.nodes().not(node).not(node.connectedNodes()).addClass('dimmed');
        cy.edges().not(node.connectedEdges()).addClass('dimmed');
      }
    }
  }, [biases, selectedBiasId]);

  return (
    <div className="absolute inset-0">
      {/* The Cytoscape canvas will mount into this element */}
      <div ref={containerRef} className="h-full w-full rounded-none lg:rounded-xl bg-white shadow-sm border border-slate-200" />
    </div>
  );
});

export default Graph;

// Utility: clear all highlight/dim classes and destroy any open tooltips
function clearHighlights(cy) {
  cy.nodes().forEach((n) => {
    const tip = n.scratch('_tip');
    if (tip) {
      tip.destroy();
      n.removeScratch('_tip');
    }
  });

  cy.nodes().removeClass('hovered selected neighbor dimmed');
  cy.edges().removeClass('edge-highlight dimmed');
}
```

```javascript
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * SidePanel:
 * - Desktop: rendered in the right column, always present
 * - Mobile: rendered as a bottom sheet/drawer with slide animation
 * 
 * Props:
 * - bias: currently selected bias object (or null)
 * - onClose: close handler (used on mobile)
 * - onSelectRelated: callback for clicking a related bias id
 * - isMobile: toggles drawer mode and close button
 */
export default function SidePanel({ bias, onClose, onSelectRelated, isMobile }) {
  // Desktop static panel
  if (!isMobile) {
    return (
      <div className="sticky top-4 h-[calc(100vh-6rem)] overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {bias ? <PanelContent bias={bias} onSelectRelated={onSelectRelated} /> : <Placeholder />}
      </div>
    );
  }

  // Mobile drawer variant
  return (
    <AnimatePresence>
      {bias && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-50"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <div className="mx-auto max-w-7xl px-4 pb-safe">
            <div className="rounded-t-2xl border border-slate-200 bg-white shadow-lg">
              <div className="flex items-center justify-between p-3 border-b border-slate-200">
                <div className="h-1.5 w-12 rounded-full bg-slate-300 mx-auto" />
              </div>
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-base font-semibold">
                    {bias.name}
                  </h2>
                  <button
                    onClick={onClose}
                    className="ml-2 inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    Close
                  </button>
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
    <div className="h-full grid place-items-center text-sm text-slate-500 p-6">
      Select a bias from the network to see details here.
    </div>
  );
}

function PanelContent({ bias, onSelectRelated }) {
  return (
    <div className="space-y-4">
      {/* Category badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Category</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: categoryColor(bias.category) }}
          />
          {bias.category}
        </span>
      </div>

      {/* Funny summary */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Funny summary
        </div>
        <p className="text-sm text-slate-800">
          {bias.funny_summary}
        </p>
      </div>

      {/* Description */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">
          Description
        </div>
        <p className="text-sm leading-6 text-slate-800 whitespace-pre-wrap">
          {bias.description}
        </p>
      </div>

      {/* Related biases */}
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
          Related biases
        </div>
        {bias.related && bias.related.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {bias.related.map((rid) => (
              <li key={rid}>
                <button
                  onClick={() => onSelectRelated(rid)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                  title="Focus on this related bias"
                >
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
    </div>
  );
}

function categoryColor(category) {
  switch (category) {
    case 'Self & Ego':
      return '#2563eb';
    case 'Social Arena':
      return '#16a34a';
    case 'Decision Desert':
      return '#f59e0b';
    case 'Memory Jungle':
      return '#ef4444';
    case 'Reality Rift':
      return '#9333ea';
    default:
      return '#64748b';
  }
}
```

```json
[
  {
    "id": "anchoring",
    "name": "Anchoring",
    "category": "Decision Desert",
    "funny_summary": "First number says it louder, your brain claps the hardest.",
    "description": "Anchoring is the tendency to rely too heavily on the first piece of information offered (the anchor) when making decisions. Adjustments away from the anchor are often insufficient.",
    "related": ["confirmation", "sunk_cost", "loss_aversion"]
  },
  {
    "id": "confirmation",
    "name": "Confirmation Bias",
    "category": "Reality Rift",
    "funny_summary": "Your beliefs hire only facts that agree with them.",
    "description": "Confirmation bias is the tendency to search for, interpret, favor, and recall information in a way that confirms one's preexisting beliefs or hypotheses.",
    "related": ["anchoring", "bandwagon", "negativity"]
  },
  {
    "id": "availability",
    "name": "Availability Heuristic",
    "category": "Memory Jungle",
    "funny_summary": "If it pops into mind fast, it must be true (says your brain).",
    "description": "People evaluate the likelihood of events based on how easily examples come to mind, which can be biased by recent exposure or vividness rather than actual probability.",
    "related": ["negativity", "hindsight", "loss_aversion"]
  },
  {
    "id": "hindsight",
    "name": "Hindsight Bias",
    "category": "Memory Jungle",
    "funny_summary": "\"I knew it all along\"—your memory, after the ending is revealed.",
    "description": "Hindsight bias is the tendency to see events as having been predictable after they have already occurred, distorting memory of prior uncertainty.",
    "related": ["availability", "confirmation"]
  },
  {
    "id": "dunning_kruger",
    "name": "Dunning–Kruger Effect",
    "category": "Self & Ego",
    "funny_summary": "Confidence climbs the hill long before competence catches up.",
    "description": "People with low ability at a task tend to overestimate their ability. High performers may underestimate their relative competence.",
    "related": ["fundamental_attribution", "bandwagon"]
  },
  {
    "id": "fundamental_attribution",
    "name": "Fundamental Attribution Error",
    "category": "Social Arena",
    "funny_summary": "Others trip because they're clumsy; you trip because the ground was sneaky.",
    "description": "The tendency to overemphasize personality-based explanations for others' behavior while underemphasizing situational explanations.",
    "related": ["dunning_kruger", "bandwagon"]
  },
  {
    "id": "bandwagon",
    "name": "Bandwagon Effect",
    "category": "Social Arena",
    "funny_summary": "If everyone's doing it, it must be brilliant (right?).",
    "description": "Adopting beliefs because many others hold them. Popularity itself becomes a signal of correctness, irrespective of evidence.",
    "related": ["confirmation", "fundamental_attribution", "dunning_kruger"]
  },
  {
    "id": "loss_aversion",
    "name": "Loss Aversion",
    "category": "Decision Desert",
    "funny_summary": "Losing $5 hurts more than finding $5 feels good.",
    "description": "Losses loom larger than gains. People prefer avoiding losses to acquiring equivalent gains, influencing risk-taking and choices.",
    "related": ["anchoring", "availability", "sunk_cost"]
  },
  {
    "id": "sunk_cost",
    "name": "Sunk Cost Fallacy",
    "category": "Decision Desert",
    "funny_summary": "Throwing good time after bad because you've already paid.",
    "description": "Continuing a behavior or endeavor as a result of previously invested resources (time, money, effort) even if the future costs outweigh the benefits.",
    "related": ["anchoring", "loss_aversion"]
  },
  {
    "id": "negativity",
    "name": "Negativity Bias",
    "category": "Reality Rift",
    "funny_summary": "Bad news yells; good news whispers.",
    "description": "Negative events and emotions have a greater psychological impact than neutral or positive ones, affecting memory, attention, and decision-making.",
    "related": ["availability", "confirmation"]
  }
]
```

```css
/* Tailwind Directives (build-time) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Minimal modern base styles (optional enhancements) */
@layer base {
  html, body, #__next {
    height: 100%;
  }

  /* Smooth font rendering */
  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Utilities for safe-area padding on iOS */
@layer utilities {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Optional: tippy fallback if you don't import its CSS
   This provides basic tooltip styling in case the user
   didn't add `import 'tippy.js/dist/tippy.css'` to pages/_app.js */
.tippy-box[data-theme~='light-border'] {
  background-color: #fff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.tippy-box[data-theme~='light-border'] .tippy-content {
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.2;
}
```

```javascript
      /** @type {import('tailwindcss').Config} */
      module.exports = {
        content: ['./pages/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
        theme: { extend: {} },
        plugins: []
      };
```

```javascript
      module.exports = {
        plugins: {
          tailwindcss: {},
          autoprefixer: {}
        }
      };
```

```javascript
    import '../styles/tailwind.css';
    import 'tippy.js/dist/tippy.css'; // optional, for prettier tooltips
    export default function App({ Component, pageProps }) {
      return <Component {...pageProps} />;
    }
```

```shellscript
    npm install
    npm run dev
```

---

**User**

Please do it fof me, the project's foloder is E:\Projects\Website History\bias

---

**Cursor**

I'll scaffold the Next.js app in your specified folder, install dependencies, set up Tailwind, and add the graph components and data. Then I'll finish by giving you the run command.

Creating the project folder structure and initializing the project, then I'll add the source files in batches.

I created the folder structure and attempted to initialize npm, but the shell reported a PSReadLine rendering bug. I’ll verify the folder contents, then create the necessary project files directly and install dependencies.

I’m going to write all required project files using PowerShell here-strings to avoid the interactive bug, then install dependencies.

---

**User**

please resume

---

**Cursor**

I'll verify and fix the written files (especially JSON and Tailwind CSS) and then proceed to install dependencies if possible.

I verified the files were created and valid. I'll mark Tailwind setup and scaffolding as complete, then give you the final run steps since npm isn't available in this shell.

- Built the project files in E:\Projects\Website History\bias and verified contents. The shell cannot run npm here; you can install/start from your local terminal instead.

Do this locally:
1) Open a new terminal (outside this restricted shell), then run:
- cd "E:\Projects\Website History\bias"
- npm install
- npm run dev

2) Visit http://localhost:3000

Notes:
- Files created: `pages/_app.js`, `pages/index.js`, `components/Graph.js`, `components/SidePanel.js`, `public/data/biases.json`, `styles/tailwind.css`, `tailwind.config.js`, `postcss.config.js`, `package.json`.
- If tooltips look plain, ensure `pages/_app.js` includes: `import 'tippy.js/dist/tippy.css'`.

---

**User**

'npm' n’est pas reconnu en tant que commande interne
ou externe, un programme exécutable ou un fichier de commandes.

---

**Cursor**

- Your system doesn’t have Node.js/npm in PATH. Install Node.js LTS, then run the app.

Do one of these:
- Option 1 (recommended): Install Node.js LTS from `https://nodejs.org/en/download`, then close/reopen your terminal.
- Option 2 (PowerShell, if you have winget): Run:
  - winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent
  - Close/reopen the terminal after it finishes.

Then run the project:
- cd "E:\Projects\Website History\bias"
- npm install
- npm run dev
- Open http://localhost:3000

If PATH still isn’t updated:
- Use the full npm path:
  - "C:\Program Files\nodejs\npm.cmd" install
  - "C:\Program Files\nodejs\npm.cmd" run dev

---

**User**

the cd command does not work

