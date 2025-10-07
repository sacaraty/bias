import Head from 'next/head';

export default function About() {
  return (
    <>
      <Head>
        <title>About | Cognitive Bias Network</title>
      </Head>
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-semibold">About this project</h1>
        <p className="text-slate-700">This website visualizes cognitive biases and their relationships, linking concepts to the scientists who discovered or developed them. It is built for curiosity and learning.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <AboutCard title="Interactive Map" desc="Explore how biases relate across categories using a dynamic graph." />
          <AboutCard title="Researchers" desc="Meet the scientists behind the discoveries, and their signature achievements." />
          <AboutCard title="Timeline" desc="View discovery chronology for biases or the life spans of key authors." />
        </div>
        <p className="text-slate-700">Future plans include search, filters, and deeper sourcing. Contributions and suggestions are welcome.</p>
      </div>
    </>
  );
}

function AboutCard({ title, desc }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-base font-semibold mb-1">{title}</div>
      <div className="text-sm text-slate-700">{desc}</div>
    </div>
  );
}

