import { test, expect } from '../src/fixture/conf.fixture'

// url dev = https://playwright.dev
// url production = https://playwright.production
test('has title', {
  tag: ["@t1"],
}, async ({ page, conf }) => {
  console.log("Running test on env: ", process.env.ENV);
  console.log("Tagging person: ", process.env.TAGGING_PERSON);
  console.log("Running test on url: ", conf.url);
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('get started link',
  {
    tag: ["@t2"]
  }
  , async ({ page }) => {
    console.log("Running test on env: ", process.env.ENV);
    await page.goto('https://playwright.dev/');

    await page.getByRole('link', { name: 'Get started' }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
  });
