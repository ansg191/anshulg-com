import {
  test,
  expect,
  type Locator,
  type BrowserContext,
} from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("has title", async ({ page }) => {
  await expect(page).toHaveTitle("Anshul Gupta");
});

test("has header", async ({ page }) => {
  let header = page.locator("header");
  await expect(header).toBeVisible();
  await expect(header.locator("div").first()).toHaveText("ANSHUL GUPTA (7)");
  await expect(header.locator("div").last()).toHaveText("ANSHUL GUPTA (7)");
  await expect(header.locator("h1")).toHaveText(
    "Miscellaneous Information Manual",
  );
});

test("has Email link", async ({ page }) => {
  let emailLink = page.getByRole("link", { name: "ansg191@anshulg.com" });
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveText("ansg191@anshulg.com");
  await expect(emailLink).toHaveAttribute("href", "mailto:ansg191@anshulg.com");
});

test("has GitHub link", async ({ page, context }) => {
  let ghLink = page.getByRole("link", { name: "ansg191" }).nth(1);
  await checkLinkNewTab(context, ghLink, "https://github.com/ansg191");
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
