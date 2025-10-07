import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';
import { CATEGORY_COLORS } from './categories';

if (typeof window !== 'undefined' && !cytoscape.prototype.popper) {
  cytoscape.use(popper);
}

// Placeholder inline SVG icon used in the middle of nodes. Replace later as needed.
const ICON_DATA_URI = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">'
  + '<circle cx="12" cy="12" r="9" fill="white" />'
  + '<path d="M12 7a5 5 0 0 1 5 5h-2a3 3 0 0 0-3-3V7z" fill="#475569"/>'
  + '</svg>'
);

function buildElements(biases) {
  const nodes = biases.map((b) => {
    const category = normalizeCategory(b.category, b.name, b.id);
    return {
      data: { id: b.id, label: b.name, category, funny: b.funny_summary }
    };
  });

  // Build a fast lookup of existing ids to avoid edges to missing nodes
  const idSet = new Set(biases.map((b) => String(b.id)));

  const seen = new Set();
  const edges = [];
  for (const b of biases) {
    const src = String(b.id);
    const related = Array.isArray(b.related) ? b.related : [];
    for (const rawTarget of related) {
      const tgt = String(rawTarget);
      if (!idSet.has(tgt)) continue; // skip edges to non-existent nodes
      if (tgt === src) continue;     // skip self-edges

      const a = src < tgt ? src : tgt;
      const c = src < tgt ? tgt : src;
      const key = `${a}__${c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ data: { id: `e_${a}_${c}`, source: a, target: c } });
    }
  }
  return { nodes, edges };
}

function normalizeCategory(category, name, id) {
  const c = String(category || '').trim();
  if (c && c.toLowerCase() !== 'cognitive bias') return c; // keep explicit non-generic categories
  return inferCategoryFromNameId(String(name || ''), String(id || ''));
}

function inferCategoryFromNameId(name, id) {
  const hay = `${name} ${id}`.toLowerCase();

  const decision = [
    'anchoring', 'frame', 'framing', 'loss', 'endowment', 'sunk', 'prospect', 'planning', 'status quo', 'decoy', 'zero-risk',
    'money illusion', 'risk', 'projection', 'overconfidence', 'pseudocertainty', 'estimation', 'base rate', 'representativeness',
    'gambler', 'optimism', 'choice', 'decision', 'cost', 'value', 'certainty', 'ambiguity'
  ];

  const social = [
    'bandwagon', 'groupthink', 'bystander', 'herd', 'authority', 'false consensus', 'in-group', 'out-group', 'cheerleader',
    'reciprocity', 'conformity', 'social'
  ];

  const memory = [
    'availability', 'hindsight', 'false memory', 'recency', 'primacy', 'duration', 'consistency', 'mere-exposure', 'spotlight',
    'memory', 'negativity', 'end-of-history', 'context effect', 'regression to the mean'
  ];

  const self = [
    'dunning', 'self-serving', 'egocentric', 'bias blind spot', 'moral credential', 'illusion of explanatory depth', 'ikea effect',
    'overjustification'
  ];

  const reality = [
    'confirmation', 'belief bias', 'cognitive dissonance', 'curse of knowledge', 'illusion', 'placebo', 'implicit', 'illusory',
    'essentialism', 'salience', 'contrast', 'normalization of deviance', 'information bias', 'attribute substitution'
  ];

  const match = (list) => list.some((k) => hay.includes(k));
  if (match(decision)) return 'Decision Desert';
  if (match(social)) return 'Social Arena';
  if (match(memory)) return 'Memory Jungle';
  if (match(self)) return 'Self & Ego';
  if (match(reality)) return 'Reality Rift';
  // Fallback: keep previous palette but choose a reasonable default
  return 'Decision Desert';
}

const Graph = forwardRef(function Graph(
  { biases = [], selectedBiasId = null, onSelectBias = () => {}, onClearSelection = () => {}, onPanelStateChange = () => {} },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

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
        cy.animate({ center: { eles: node }, zoom: Math.min(1.2, Math.max(0.8, cy.zoom())) }, { duration: 450, easing: 'ease-in-out' });
      }
    }
  }));

  useEffect(() => {
    if (!containerRef.current) return;
    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: [
        { selector: 'node', style: {
          'background-color': (ele) => CATEGORY_COLORS[ele.data('category')] || '#64748b',
          'shape': 'ellipse',
          'label': 'data(label)',
          'color': '#1f2937',
          'font-size': '10px',
          'text-wrap': 'wrap',
          'text-max-width': '110px',
          'text-valign': 'center',
          'text-halign': 'center',
          'width': 40,
          'height': 40,
          'border-width': 3,
          'border-color': '#ffffff',
          'background-image': ICON_DATA_URI,
          'background-width': '60%',
          'background-height': '60%',
          'background-fit': 'contain',
          'background-clip': 'none',
          'background-position-x': '50%',
          'background-position-y': '50%',
          'overlay-opacity': 0,
          'transition-property': 'background-color, width, height, border-width, line-color, opacity, background-image',
          'transition-duration': '150ms',
          'transition-timing-function': 'ease-in-out',
          'z-index': 1
        }},
        { selector: 'node.hovered', style: { 'width': 48, 'height': 48, 'border-width': 4 } },
        { selector: 'node.selected', style: { 'width': 56, 'height': 56, 'border-width': 4 } },
        { selector: 'node.neighbor', style: { 'opacity': 0.9 } },
        { selector: 'edge', style: {
          'curve-style': 'unbundled-bezier',
          'control-point-distances': [20, -20],
          'opacity': 0.35,
          'line-color': '#94a3b8',
          'width': 2,
          'transition-property': 'line-color, width, opacity',
          'transition-duration': '150ms',
          'z-index': 0
        }},
        { selector: 'edge.edge-highlight', style: { 'opacity': 0.9, 'line-color': '#0ea5e9', 'width': 3 } },
        { selector: 'node.dimmed', style: { 'opacity': 0.25 } },
        { selector: 'edge.dimmed', style: { 'opacity': 0.1 } }
      ],
      layout: { name: 'cose', fit: true, padding: 30, nodeOverlap: 8, nodeRepulsion: 8000, idealEdgeLength: 80 },
      wheelSensitivity: 0.2,
      pixelRatio: 2
    });

    // Allow deeper zoom for focus
    if (typeof cy.maxZoom === 'function') cy.maxZoom(4);
    if (typeof cy.minZoom === 'function') cy.minZoom(0.1);

    cyRef.current = cy;

    const showTooltip = (evt) => {
      const node = evt.target;
      node.addClass('hovered');
      const ref = node.popperRef();
      const content = document.createElement('div');
      content.className = 'text-sm';
      const label = node.data('label');
      const funny = node.data('funny');
      content.innerHTML = `<strong>${label}</strong><div class="text-slate-600">${funny || ''}</div>`;
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
      if (tip) { tip.destroy(); node.removeScratch('_tip'); }
    };

    cy.on('mouseover', 'node', showTooltip);
    cy.on('mouseout', 'node', hideTooltip);

    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const id = node.id();
      clearHighlights(cy);
      node.addClass('selected');
      node.connectedEdges().addClass('edge-highlight');
      node.connectedNodes().addClass('neighbor');
      cy.nodes().not(node).not(node.connectedNodes()).addClass('dimmed');
      cy.edges().not(node.connectedEdges()).addClass('dimmed');
      const desiredZoom = Math.min(3.5, typeof cy.maxZoom === 'function' ? cy.maxZoom() : 3.5);
      cy.animate({ center: { eles: node }, zoom: desiredZoom }, { duration: 350, easing: 'ease-in-out' });
      onSelectBias(id);
      onPanelStateChange(true);
    });

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      clearHighlights(cy);
      edge.addClass('edge-highlight');
      const ends = edge.connectedNodes();
      ends.addClass('neighbor');
      cy.nodes().not(ends).addClass('dimmed');
      cy.edges().not(edge).addClass('dimmed');
      onPanelStateChange(false);
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        clearHighlights(cy);
        onClearSelection();
        onPanelStateChange(false);
      }
    });

    const handleResize = () => { cy.resize(); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cy.destroy(); cyRef.current = null; };
  }, [onClearSelection, onPanelStateChange, onSelectBias]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    const { nodes, edges } = buildElements(biases);
    cy.elements().remove();
    cy.add([...nodes, ...edges]);
    cy.layout({ name: 'cose', fit: true, padding: 30 }).run();
    if (selectedBiasId) {
      const node = cy.$(`node[id = "${selectedBiasId}"]`);
      if (node.nonempty()) {
        cy.center(node);
        node.addClass('selected');
        node.connectedEdges().addClass('edge-highlight');
        node.connectedNodes().addClass('neighbor');
        cy.nodes().not(node).not(node.connectedNodes()).addClass('dimmed');
        cy.edges().not(node.connectedEdges()).addClass('dimmed');
        const desiredZoom = Math.min(3.5, typeof cy.maxZoom === 'function' ? cy.maxZoom() : 3.5);
        cy.animate({ center: { eles: node }, zoom: desiredZoom }, { duration: 350, easing: 'ease-in-out' });
      }
    }
  }, [biases, selectedBiasId]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="h-full w-full rounded-none lg:rounded-xl bg-white shadow-sm border border-slate-200" />
    </div>
  );
});

export default Graph;

function clearHighlights(cy) {
  cy.nodes().forEach((n) => {
    const tip = n.scratch('_tip'); if (tip) { tip.destroy(); n.removeScratch('_tip'); }
  });
  cy.nodes().removeClass('hovered selected neighbor dimmed');
  cy.edges().removeClass('edge-highlight dimmed');
}
