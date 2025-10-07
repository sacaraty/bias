export const CATEGORIES = [
  {
    key: 'Self & Ego',
    slug: 'self-ego',
    color: '#2563eb',
    description: 'Biases rooted in self-perception, ego, confidence and self-evaluation.'
  },
  {
    key: 'Social Arena',
    slug: 'social-arena',
    color: '#16a34a',
    description: 'Biases influenced by social dynamics such as conformity, authority, and groups.'
  },
  {
    key: 'Decision Desert',
    slug: 'decision-desert',
    color: '#f59e0b',
    description: 'Biases affecting judgment and decision-making under risk and uncertainty.'
  },
  {
    key: 'Memory Jungle',
    slug: 'memory-jungle',
    color: '#ef4444',
    description: 'Biases emerging from memory, recall, and the way past events are stored or retrieved.'
  },
  {
    key: 'Reality Rift',
    slug: 'reality-rift',
    color: '#9333ea',
    description: 'Biases that distort perception of reality, evidence, and beliefs.'
  }
];

export const CATEGORY_COLORS = Object.fromEntries(CATEGORIES.map(c => [c.key, c.color]));

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || '#64748b';
}

export function slugToCategory(slug) {
  const found = CATEGORIES.find(c => c.slug === slug);
  return found ? found.key : null;
}


