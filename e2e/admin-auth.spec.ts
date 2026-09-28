import { test, expect } from "@playwright/test";
import {
  checkCredentials,
  makeSessionToken,
  verifySessionToken,
  SESSION_TTL_MS,
} from "../src/lib/adminAuth";

/**
 * Вход в админку: несколько пользователей и срок сессии. Чистая логика —
 * браузер не нужен, на мобильном проекте пропускаем.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "чистая логика, от устройства не зависит");
  process.env.ADMIN_USER = "admin";
  process.env.ADMIN_PASSWORD = "main-pass";
  process.env.ADMIN_USERS = "veronika:her:pass;broken;  ;ivan:ivan-pass";
  process.env.ADMIN_SESSION_SECRET = "unit-secret";
});

test.describe("Пользователи", () => {
  test("основной вход работает как раньше", () => {
    expect(checkCredentials("admin", "main-pass")).toBe(true);
    expect(checkCredentials("admin", "wrong")).toBe(false);
  });

  test("дополнительные из ADMIN_USERS; пароль может содержать двоеточие", () => {
    expect(checkCredentials("veronika", "her:pass")).toBe(true);
    expect(checkCredentials("ivan", "ivan-pass")).toBe(true);
    // Чужой пароль не подходит
    expect(checkCredentials("veronika", "ivan-pass")).toBe(false);
  });

  test("неизвестный логин и пустой пароль не пускают", () => {
    expect(checkCredentials("broken", "")).toBe(false);
    expect(checkCredentials("nobody", "main-pass")).toBe(false);
    expect(checkCredentials("veronika", "")).toBe(false);
  });
});

test.describe("Сессия", () => {
  test("токен помнит, кто вошел", () => {
    expect(verifySessionToken(makeSessionToken("veronika"))).toBe("veronika");
  });

  test("просроченный токен отвергается — раньше он жил вечно", () => {
    const issued = Date.now() - SESSION_TTL_MS - 1000;
    expect(verifySessionToken(makeSessionToken("admin", issued))).toBeNull();
  });

  test("подделанный токен отвергается", () => {
    const [payload, sig] = makeSessionToken("ivan").split(".");
    const forged = Buffer.from(JSON.stringify({ u: "admin", t: Date.now() })).toString(
      "base64url"
    );
    expect(verifySessionToken(`${forged}.${sig}`)).toBeNull();
    expect(verifySessionToken(`${payload}.${"0".repeat(sig.length)}`)).toBeNull();
    expect(verifySessionToken("мусор")).toBeNull();
  });

  test("убрали пользователя из ADMIN_USERS — его сессия больше не действует", () => {
    const token = makeSessionToken("ivan");
    process.env.ADMIN_USERS = "veronika:her:pass";
    expect(verifySessionToken(token)).toBeNull();
  });
});
