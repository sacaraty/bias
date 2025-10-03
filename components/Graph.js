import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import cytoscape from 'cytoscape';
import popper from 'cytoscape-popper';
import tippy from 'tippy.js';

if (typeof window !== 'undefined' && !cytoscape.prototype.popper) {
  cytoscape.use(popper);
}

const CATEGORY_COLORS = {
  'Self & Ego': '#2563eb',
  'Social Arena': '#16a34a',
  'Decision Desert': '#f59e0b',
  'Memory Jungle': '#ef4444',
  'Reality Rift': '#9333ea'
};

function buildElements(biases) {
  const nodes = biases.map((b) => ({
    data: { id: b.id, label: b.name, category: b.category, funny: b.funny_summary }
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
      edges.push({ data: { id: `e_${a}_${c}`, source: a, target: c } });
    }
  }
  return { nodes, edges };
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
        }},
        { selector: 'node.hovered', style: { 'width': 34, 'height': 34, 'border-width': 3 } },
        { selector: 'node.selected', style: { 'width': 38, 'height': 38, 'border-width': 3 } },
        { selector: 'node.neighbor', style: { 'opacity': 0.9 } },
        { selector: 'edge', style: {
          'curve-style': 'unbundled-bezier',
          'control-point-distances': [20, -20],
          'opacity': 0.35,
          'line-color': '#94a3b8',
          'width': 2,
          'transition-property': 'line-color, width, opacity',
          'transition-duration': '250ms',
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
      cy.animate({ center: { eles: node }, zoom: Math.min(1.2, Math.max(0.8, cy.zoom())) }, { duration: 450, easing: 'ease-in-out' });
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
