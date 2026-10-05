"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "./navLinks";

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b border-teal/10 bg-mist/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-graphite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/vibemind-icon.png" alt="ВайбМайнд" className="h-9 w-auto" />
          <span className="whitespace-nowrap">ВайбМайнд</span>
        </Link>
        {/* Порог бургер-меню — xl: на ~950px пункты наезжали на логотип */}
        <ul className="hidden items-center gap-4 text-sm font-medium text-graphite/70 xl:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="whitespace-nowrap transition-colors hover:text-teal">
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link
              href="/app?new=1"
              className="whitespace-nowrap rounded-2xl px-5 py-2.5 font-semibold text-white shadow-teal transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #1ca5a8, #19c9a2)" }}
            >
              ИИ-консультация
            </Link>
          </li>
        </ul>
        <button
          className="flex flex-col gap-1.5 p-2 xl:hidden"
          aria-label="Меню"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="h-0.5 w-6 bg-graphite" />
          <span className="h-0.5 w-6 bg-graphite" />
          <span className="h-0.5 w-6 bg-graphite" />
        </button>
      </div>
      {menuOpen && (
        <ul className="border-t border-teal/10 bg-mist px-5 py-4 xl:hidden">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="block py-2 font-medium text-graphite/80"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li className="pt-2">
            <Link href="/app?new=1" className="btn-teal w-full justify-center">
              ИИ-консультация
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
