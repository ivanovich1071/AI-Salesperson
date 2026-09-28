/**
 * Пункты меню сайта ВайбМайнд. Якоря — с «/» впереди: на главной браузер
 * просто прокручивает к секции, с других страниц (/solutions) ведет на главную.
 *
 * Отдельный файл без "use client": список нужен и клиентскому меню, и серверному подвалу.
 */
export const NAV_LINKS = [
  { href: "/#benefits", label: "Преимущества" },
  { href: "/#process", label: "Как мы работаем" },
  { href: "/#formats", label: "Форматы" },
  { href: "/solutions", label: "Решения" },
  { href: "/#course", label: "Курс" },
  { href: "/#about", label: "О компании" },
  { href: "/#contacts", label: "Контакты" },
];
