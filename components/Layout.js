import Link from 'next/link';
import { CATEGORIES, categoryColor } from './categories';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-base sm:text-lg font-semibold">Cognitive Bias Network</Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link className="text-slate-600 hover:text-slate-900" href="/">Home</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/people">Scientists</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/contact">Contact us</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/map">Map</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/timeline">Timeline</Link>
          <Link className="text-slate-600 hover:text-slate-900" href="/about">About</Link>
        </nav>
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function MobileMenu() {
  return (
    <div className="relative">
      {/* Simple overflow menu using details/summary for no-JS baseline */}
      <details className="group">
        <summary className="list-none inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-sm cursor-pointer">
          Menu
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-600"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </summary>
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg p-2 space-y-1">
          <a className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm" href="/">Home</a>
          <a className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm" href="/people">Scientists</a>
          <a className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm" href="/contact">Contact us</a>
          <a className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm" href="/map">Map</a>
          <a className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm" href="/timeline">Timeline</a>
          <a className="block px-2 py-1.5 rounded hover:bg-slate-50 text-sm" href="/about">About</a>
        </div>
      </details>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-4 text-xs sm:text-sm text-slate-600 flex flex-wrap items-center justify-between gap-2">
        <div>
          © {new Date().getFullYear()} Cognitive Bias Network. Built with Next.js, Cytoscape, Tailwind.
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {CATEGORIES.map((c) => (
            <a key={c.slug} href={`/categories/${c.slug}`} className="inline-flex items-center gap-1 hover:text-slate-900">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: categoryColor(c.key) }} />
              {c.key}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}


