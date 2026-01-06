import {
  test,
  expect,
  type Locator,
  type BrowserContext,
} from "@playwright/test";
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
