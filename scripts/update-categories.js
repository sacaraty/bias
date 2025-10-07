const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '..', 'public', 'data', 'biases.json');
const text = fs.readFileSync(jsonPath, 'utf8');
const data = JSON.parse(text);

const decision = ['anchoring','frame','framing','loss','endowment','sunk','prospect','planning','status quo','decoy','zero-risk','money illusion','risk','projection','overconfidence','pseudocertainty','estimation','base rate','representativeness','gambler','optimism','choice','decision','cost','value','certainty','ambiguity'];
const social = ['bandwagon','groupthink','bystander','herd','authority','false consensus','in-group','out-group','cheerleader','reciprocity','conformity','social'];
const memory = ['availability','hindsight','false memory','recency','primacy','duration','consistency','mere-exposure','spotlight','memory','negativity','end-of-history','context effect','regression to the mean'];
const self = ['dunning','self-serving','egocentric','bias blind spot','moral credential','illusion of explanatory depth','ikea effect','overjustification'];
const reality = ['confirmation','belief bias','cognitive dissonance','curse of knowledge','illusion','placebo','implicit','illusory','essentialism','salience','contrast','normalization of deviance','information bias','attribute substitution'];

const matchAny = (hay, list) => list.some(k => hay.includes(k));
const infer = (name, id) => {
  const hay = `${(name||'')} ${(id||'')}`.toLowerCase();
  if (matchAny(hay, decision)) return 'Decision Desert';
  if (matchAny(hay, social)) return 'Social Arena';
  if (matchAny(hay, memory)) return 'Memory Jungle';
  if (matchAny(hay, self)) return 'Self & Ego';
  if (matchAny(hay, reality)) return 'Reality Rift';
  return 'Decision Desert';
};

const out = data.map((b) => {
  const c = String(b.category || '').trim();
  if (c && c.toLowerCase() !== 'cognitive bias') return b;
  return { ...b, category: infer(b.name, b.id) };
});

fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2));
console.log('Updated categories in biases.json');


