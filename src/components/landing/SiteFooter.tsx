import Link from "next/link";
import { NAV_LINKS } from "./navLinks";

export default function SiteFooter() {
  return (
    <footer className="bg-graphite py-10 text-sm text-white/60">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 font-bold text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/vibemind-icon.png" alt="ВайбМайнд" className="h-8 w-auto" />
            ВайбМайнд
          </div>
          <div className="flex flex-wrap justify-center gap-5">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-teal">
                {l.label}
              </a>
            ))}
            <Link href="/faq" className="hover:text-teal">
              Вопросы и ответы
            </Link>
            <Link href="/privacy" className="hover:text-teal">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-center">
          © 2025–2026 ВайбМайнд. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
