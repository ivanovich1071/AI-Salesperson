/**
 * Заголовки безопасности.
 *
 * До этого файл был пустым: сайт можно было встроить в чужой <iframe> и собирать
 * клики обманом, браузер не защищал от подмены типов содержимого.
 *
 * `microphone=(self)` — обязательно: голосовой ввод в визарде (MicButton) без него
 * перестанет работать.
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

/**
 * CSP пока только наблюдает (Report-Only). Next вставляет инлайновые скрипты, и
 * боевая политика с ходу положила бы гидратацию. Смотрим отчёты в консоли неделю,
 * потом переключаем ключ на `Content-Security-Policy`.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...SECURITY_HEADERS,
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
    ];
  },

  /**
   * Агенты ИИ ищут правила использования контента в `/.well-known/ai.txt`.
   * Отдельным маршрутом это не сделать: каталог, имя которого начинается с
   * точки, Next в маршруты не берёт. Поэтому — rewrite на реальный роут
   * `/ai-policy.txt` (src/app/ai-policy.txt/route.ts).
   */
  async rewrites() {
    return [
      { source: "/.well-known/ai.txt", destination: "/ai-policy.txt" },
      { source: "/ai.txt", destination: "/ai-policy.txt" },
    ];
  },
};

export default nextConfig;
