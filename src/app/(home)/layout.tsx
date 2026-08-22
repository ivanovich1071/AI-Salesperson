import JsonLd from "@/components/seo/JsonLd";
import { graph, productsLd } from "@/lib/seo/jsonLd";

/**
 * Обёртка только для главной (группа `(home)` не влияет на адрес — это по-прежнему `/`).
 *
 * Зачем отдельный layout: витрину «Лаборатория решений» размечаем там, где она
 * действительно есть. Разметка, описывающая контент другой страницы, — ровно тот
 * случай, за который поисковики понижают доверие к домену.
 *
 * Сама страница — клиентский компонент, а серверный layout держит разметку вне
 * клиентского бандла.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={graph(productsLd())} />
      {children}
    </>
  );
}
