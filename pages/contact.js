import Head from 'next/head';

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact us | Cognitive Bias Network</title>
      </Head>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Contact us</h1>
        <p className="text-sm text-slate-600 mb-6">Email: <a className="text-sky-600 hover:underline" href="mailto:hello@cogbias.net">hello@cogbias.net</a></p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700 mb-1">Your name</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="text" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Email</label>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">Message</label>
            <textarea className="w-full rounded-md border border-slate-300 px-3 py-2" rows="5" placeholder="How can we help?" />
          </div>
          <button type="button" className="inline-flex items-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800">Send</button>
        </form>
      </div>
    </>
  );
}

