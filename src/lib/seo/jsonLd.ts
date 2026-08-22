// ============================================================
// JSON-LD (Schema.org) — структурированные данные для поисковиков и ИИ.
//
// Зачем: ChatGPT Search, Perplexity, Gemini и Google AI Overviews берут из
// разметки готовые факты — кто компания, что продаёт, кто автор курса,
// какие вопросы закрывает сайт. Без разметки модель пересказывает страницу
// своими словами и чаще ошибается в названии, контактах и услугах.
//
// Все факты приходят из profile.ts и faq.ts — здесь только форма.
// ============================================================

import { AUTHOR, COURSE, ORG, PRODUCTS, SERVICES, SITE_URL } from "./profile";
import { FAQ } from "./faq";

/** Относительный путь → абсолютный URL (Schema.org требует абсолютные). */
export const abs = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path}`;

/** Стабильные идентификаторы: по ним разные блоки разметки ссылаются друг на друга. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

export function organizationLd() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: ORG.name,
    alternateName: [...ORG.alternateNames],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: abs(ORG.logo),
    },
    image: abs(ORG.icon),
    description: ORG.description,
    slogan: ORG.tagline,
    knowsLanguage: [...ORG.languages],
    areaServed: ORG.areaServed.map((name) => ({ "@type": "Place", name })),
    address: {
      "@type": "PostalAddress",
      addressCountry: ORG.foundingCountry,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: ORG.phone,
        availableLanguage: ["Russian"],
        areaServed: ORG.foundingCountry,
      },
    ],
    sameAs: [ORG.telegram, ORG.github],
    makesOffer: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: s.description,
        provider: { "@id": ORG_ID },
        audience: { "@type": "Audience", audienceType: s.audience },
      },
    })),
  };
}

export function websiteLd() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: SITE_URL,
    name: ORG.name,
    description: ORG.description,
    inLanguage: "ru",
    publisher: { "@id": ORG_ID },
  };
}

export function personLd() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/course#author`,
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    description: AUTHOR.description,
    image: abs(AUTHOR.image),
    knowsAbout: [
      "Искусственный интеллект",
      "Нейросервисы",
      "Промпт-инжиниринг",
      "Цифровая трансформация организаций",
      "Корпоративное обучение",
      "Методология образования",
    ],
    hasCredential: AUTHOR.credentials.map((name) => ({
      "@type": "EducationalOccupationalCredential",
      name,
    })),
    worksFor: { "@id": ORG_ID },
  };
}

export function courseLd() {
  return {
    "@type": "Course",
    "@id": `${SITE_URL}/course#course`,
    name: COURSE.name,
    alternateName: COURSE.shortName,
    description: COURSE.description,
    url: abs(COURSE.url),
    inLanguage: "ru",
    provider: { "@id": ORG_ID },
    author: { "@id": `${SITE_URL}/course#author` },
    teaches: [...COURSE.outcomes],
    educationalLevel: "Профессиональное развитие",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "Сотрудники и руководители организаций",
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: ["onsite", "online"],
      courseWorkload: `PT${COURSE.moduleHours}H`,
      description: COURSE.mode,
      inLanguage: "ru",
    },
    // Модули курса — ИИ-ассистент отвечает по ним на вопрос «что внутри»
    hasPart: COURSE.modules.map((m) => ({
      "@type": "Course",
      name: `${m.code}. ${m.title}`,
      description: `Аудитория: ${m.audience}. Длительность: ${COURSE.moduleHours} ч.`,
      provider: { "@id": ORG_ID },
    })),
  };
}

/** Витрина «Лаборатория решений» — готовые AI-ассистенты как перечень услуг. */
export function productsLd() {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}/#solutions`,
    name: "Лаборатория решений ВайбМайнд: готовые AI-ассистенты",
    numberOfItems: PRODUCTS.length,
    itemListElement: PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: p.name,
        alternateName: p.role,
        description: `${p.task} Статус: ${p.status}.`,
        url: p.url,
        provider: { "@id": ORG_ID },
      },
    })),
  };
}

export function faqLd() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/faq#faq`,
    inLanguage: "ru",
    isPartOf: { "@id": SITE_ID },
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbLd(
  trail: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(t.url),
    })),
  };
}

/** Собирает несколько блоков в один @graph — так их читают все краулеры. */
export function graph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
