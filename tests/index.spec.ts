import {
  test,
  expect,
  type Locator,
  type BrowserContext,
} from "@playwright/test";
import { differenceCiede2000, parse } from "culori";
import AxeBuilder from "@axe-core/playwright";

test.describe("console checks", () => {
  test("no console errors", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        messages.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(messages).toEqual([]);
  });
  test("no console warnings", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "warning") {
        messages.push(msg.text());
      }
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    expect(messages).toEqual([]);
  });
});

test.describe("contents", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has title", async ({ page }) => {
    await expect(page).toHaveTitle("Anshul Gupta");
  });

  test("has header", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.locator("div").first()).toHaveText("ANSHUL GUPTA (7)");
    await expect(header.locator("div").last()).toHaveText("ANSHUL GUPTA (7)");
    await expect(header.locator("h1")).toHaveText(
      "Miscellaneous Information Manual",
    );
  });

  test("has Email link", async ({ page }) => {
    const emailLink = page.getByRole("link", { name: "ansg191@anshulg.com" });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveText("ansg191@anshulg.com");
    await expect(emailLink).toHaveAttribute(
      "href",
      "mailto:ansg191@anshulg.com",
    );
  });

  test("has GitHub link", async ({ page, context }) => {
    const ghLink = page.getByRole("link", { name: "ansg191" }).nth(1);
    await checkLinkNewTab(context, ghLink, "https://github.com/ansg191");
  });

  test.describe("Uptime Indicator", () => {
    test("has good Uptime indicator", async ({ page }) => {
      await page.waitForLoadState("networkidle");

      const link = page.getByRole("link", { name: "Git Server" });
      await expect(link).toBeVisible();

      const el = link.locator("span.absolute").nth(1);
      await expect(el).toBeVisible();

      // Check that the color is green
      const bgColor = await el.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      const expColor = "oklch(72.3% 0.219 149.579)"; // green-500
      expect(areColorsSimilar(expColor, bgColor)).toBe(true);

      // Check that the Screen Reader text is correct
      const srEl = link.locator("span.sr-only");
      await expect(srEl).toHaveText("Service Status: Up");
    });

    test("has bad Uptime indicator", async ({ page }) => {
      await page.waitForLoadState("networkidle");

      const link = page.getByRole("link", { name: "Apt Repo" });
      await expect(link).toBeVisible();

      const el = link.locator("span.absolute").nth(1);
      await expect(el).toBeVisible();

      // Check that the color is red
      const bgColor = await el.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      const expColor = "oklch(63.7% 0.237 25.331)"; // red-500
      expect(areColorsSimilar(expColor, bgColor)).toBe(true);

      // Check that the Screen Reader text is correct
      const srEl = link.locator("span.sr-only");
      await expect(srEl).toHaveText("Service Status: Down");
    });
  });

  test.describe("no JavaScript", () => {
    test.use({ javaScriptEnabled: false });
    test("status indicators are not visible", async ({ page }) => {
      await page.waitForLoadState("networkidle");

      // Check that the Git Server link is still visible
      const link = page.getByRole("link", { name: "Git Server" });
      await expect(link).toBeVisible();

      // Check that the status indicator is not visible
      const el = link.locator("span.absolute").nth(1);
      await expect(el).toBeHidden();

      // Check that the Screen Reader text is not visible
      const srEl = link.locator("span.sr-only");
      await expect(srEl).toBeHidden();
    });
  });

  test("should not have any automatically detectable accessibility issues", async ({
    page,
  }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

async function checkLinkNewTab(
  ctx: BrowserContext,
  link: Locator,
  expUrl: string,
) {
  const pagePromise = ctx.waitForEvent("page");
  await expect(link).toBeVisible();
  await link.click();
  const newPage = await pagePromise;
  await expect(newPage).toHaveURL(expUrl);
}

function areColorsSimilar(
  exp: string,
  found: string,
  threshold = 0.05,
): boolean {
  const parsedExp = parse(exp);
  const parsedFound = parse(found);

  if (!parsedExp || !parsedFound) {
    throw new Error("Invalid color format.");
  }

  const deltaE = differenceCiede2000()(parsedExp, parsedFound);
  return deltaE < threshold;
}
