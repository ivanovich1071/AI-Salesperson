import type { Metadata } from "next";

/**
 * Админка не должна попадать ни в поисковую выдачу, ни в ответы ИИ-ассистентов:
 * страница за паролем, а её адрес в индексе — приглашение к перебору.
 * В robots.txt `/admin` тоже закрыт; мета-тег страхует на случай прямой ссылки.
 */
export const metadata: Metadata = {
  title: "Админка | ВайбМайнд",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
