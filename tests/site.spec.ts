import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("all reference sections and images render without overflow", async ({
  page,
}) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Вывоз строительного",
  );
  await expect(page.locator(".service-tile")).toHaveCount(7);
  await expect(page.locator(".price-tile")).toHaveCount(4);
  await expect(page.locator(".reviews-grid .review-card")).toHaveCount(3);
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("link", {
      name: "Санкт-Петербург и Ленинградская область",
      exact: true,
    }),
  ).toBeVisible();
  const imageFailures = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((image) => image.complete && !image.naturalWidth)
        .map((image) => image.src),
    );
  expect(imageFailures).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("calculator calculates a price and prepares a WhatsApp request", async ({
  page,
}) => {
  await page
    .getByRole("textbox", { name: "Ваш адрес в Санкт-Петербурге" })
    .fill("Невский проспект, 10");
  await page
    .getByRole("combobox", { name: "Тип мусора", exact: true })
    .selectOption("construction");
  await page
    .getByRole("combobox", { name: "Примерный объём" })
    .selectOption("8");
  await page
    .getByRole("textbox", { name: "Телефон для расчёта" })
    .fill("89111234567");
  await expect(
    page.getByRole("textbox", { name: "Телефон для расчёта" }),
  ).toHaveValue("+7 (911) 123-45-67");
  await page.getByRole("button", { name: "Получить расчёт" }).click();
  await expect(page.locator(".quote-price")).toHaveText(/от 7\s000 ₽/);
  await page.getByRole("button", { name: "Оформить заявку" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Номер телефона")).toHaveValue(
    "+7 (911) 123-45-67",
  );
  await expect(dialog.getByLabel("Услуга", { exact: true })).toHaveValue(
    "container",
  );
  await expect(
    dialog.getByLabel("Адрес в Санкт-Петербурге или области"),
  ).toHaveValue("Невский проспект, 10");
  await dialog.getByLabel("Ваше имя", { exact: true }).fill("Анна");
  await dialog.getByRole("button", { name: "Подготовить заявку" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Анна, ваша заявка готова!" }),
  ).toBeVisible();
  const url = await dialog
    .getByRole("link", { name: /Отправить в WhatsApp/ })
    .getAttribute("href");
  expect(url).toContain("https://wa.me/78121234567");
  expect(decodeURIComponent(url!)).toContain("Невский проспект, 10");
  expect(decodeURIComponent(url!)).toContain("Анна");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("request form validates incomplete numbers and phone mask can be erased", async ({
  page,
}) => {
  await page.locator(".hero-cta").click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Ваше имя", { exact: true }).fill("Иван");
  await dialog.getByLabel("Услуга", { exact: true }).selectOption("bags");
  await dialog.getByLabel("Номер телефона").fill("8911");
  await dialog.getByRole("button", { name: "Подготовить заявку" }).click();
  await expect(dialog.getByText("Укажите полный номер телефона")).toBeVisible();
  const phone = dialog.getByLabel("Номер телефона");
  await phone.fill("89111234567");
  await phone.press("End");
  for (let i = 0; i < 12; i++) await phone.press("Backspace");
  await expect(phone).toHaveValue("");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("service details open an order with the selected service", async ({
  page,
}) => {
  await page.locator(".service-tile").nth(3).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Вывоз старой мебели и техники" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Заказать услугу" }).click();
  await expect(dialog.getByLabel("Услуга", { exact: true })).toHaveValue(
    "furniture",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
});

test("detailed prices select the right container", async ({ page }) => {
  await page.getByRole("button", { name: "Перейти к ценам" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".price-table-row")).toHaveCount(4);
  await dialog
    .getByRole("button", { name: "Заказать: 27 м³", exact: true })
    .click();
  await expect(dialog.locator(".selected-order")).toContainText("27 м³");
  await expect(dialog.getByLabel("Услуга", { exact: true })).toHaveValue(
    "container",
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await page.getByRole("button", { name: "Узнать подробнее" }).click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Демонтаж", exact: true }),
  ).toBeVisible();
});

test("reviews can be added, rated, sorted and retained after reload", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Все отзывы" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.locator(".review-card")).toHaveCount(6);
  await dialog.getByRole("button", { name: "Оставить отзыв" }).click();
  await dialog.getByLabel("Ваше имя", { exact: true }).fill("Тестовый клиент");
  await dialog.getByRole("button", { name: "Поставить 4 из 5" }).click();
  await dialog
    .getByLabel("Ваш отзыв", { exact: true })
    .fill("Приехали вовремя, весь мусор вывезли аккуратно.");
  await dialog.getByRole("button", { name: "Опубликовать отзыв" }).click();
  await expect(dialog.getByRole("status")).toContainText("Спасибо");
  await expect(dialog.locator(".review-card")).toHaveCount(7);
  await expect(dialog.locator(".review-card").first()).toContainText(
    "Тестовый клиент",
  );
  await expect(dialog.locator(".reviews-toolbar strong")).toHaveText("4,9");
  await dialog.locator(".review-sort select").selectOption("old");
  await expect(dialog.locator(".review-card").first()).toContainText(
    "Ольга Соколова",
  );
  await page.reload();
  await expect(
    page.locator(".reviews-grid .review-card").first(),
  ).toContainText("Тестовый клиент");
});

test("company introduction has working step controls", async ({ page }) => {
  await page
    .getByRole("button", { name: "Узнать больше о нашей работе" })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("button", { name: "Предыдущий шаг" }),
  ).toBeDisabled();
  await expect(
    dialog.getByRole("heading", { name: "Вы оставляете заявку" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Следующий шаг" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Мы берём работу на себя" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Следующий шаг" }).click();
  await expect(
    dialog.getByRole("button", { name: "Следующий шаг" }),
  ).toBeDisabled();
  await dialog
    .getByRole("button", { name: "Оставить заявку", exact: true })
    .click();
  await expect(dialog.getByLabel("Ваше имя", { exact: true })).toBeVisible();
});

test("privacy policy and sitemap are available", async ({ page }) => {
  await page
    .getByRole("button", { name: "Политика конфиденциальности" })
    .click();
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "Как работает форма" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Карта сайта", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Наши услуги" })
    .click();
  await expect(page).toHaveURL(/#services$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("navigation works at the current viewport", async ({ page }, testInfo) => {
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await expect(page.locator(".mobile-nav")).toBeVisible();
    await page
      .locator(".mobile-nav")
      .getByRole("link", { name: "Цены", exact: true })
      .click();
    await expect(page).toHaveURL(/#prices$/);
    await expect(page.locator(".mobile-nav")).toHaveCount(0);
  } else {
    await page.locator(".nav-services > button").click();
    await expect(page.locator(".services-dropdown")).toBeVisible();
    await page
      .locator(".services-dropdown")
      .getByRole("button", { name: "Демонтаж", exact: true })
      .click();
    await expect(
      page
        .getByRole("dialog")
        .getByRole("heading", { name: "Демонтаж", exact: true }),
    ).toBeVisible();
  }
});

test("layout remains within the viewport at all common widths", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth), {
        message: `Overflow at ${width}px`,
      })
      .toBeLessThanOrEqual(width);
  }
});

test("page and request form meet core accessibility checks", async ({
  page,
}) => {
  const pageAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(pageAudit.violations).toEqual([]);
  await page.locator(".hero-cta").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const formAudit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(formAudit.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.locator(".hero-cta")).toBeFocused();
});
