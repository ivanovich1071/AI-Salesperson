/**
 * Вставка структурированных данных в разметку страницы.
 *
 * `dangerouslySetInnerHTML` здесь единственный рабочий вариант: React экранирует
 * содержимое <script>, и краулер получил бы битый JSON. Данные наши, из profile.ts,
 * но `<` всё равно экранируем — иначе строка вида "</script>" в тексте закрыла бы тег.
 */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
