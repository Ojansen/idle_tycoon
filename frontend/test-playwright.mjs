import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Collect console messages and errors
const consoleLogs = [];
const pageErrors = [];

page.on('console', msg => {
  consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', err => {
  pageErrors.push(err.toString());
});

try {
  console.log('--- Navigating to page ---');
  await page.goto('http://localhost:3004/', { waitUntil: 'networkidle', timeout: 30000 });

  // Wait a moment for hydration
  await page.waitForTimeout(3000);

  console.log('--- Page title ---');
  console.log(await page.title());

  console.log('\n--- Visible text (first 2000 chars) ---');
  const bodyText = await page.innerText('body');
  console.log(bodyText.substring(0, 2000));

  console.log('\n--- Looking for setup wizard ---');
  const setupWizard = await page.$('text=Name your MegaCorp');
  console.log('Setup wizard visible:', !!setupWizard);

  // If setup wizard is showing, complete it
  if (setupWizard) {
    console.log('\n--- Completing setup wizard ---');
    // Fill company name
    const nameInput = await page.$('input[placeholder*="name" i], input[type="text"]');
    if (nameInput) {
      await nameInput.fill('Test Corp');
      console.log('Filled company name');
    }

    // Look for trait selection buttons and click two
    const traitButtons = await page.$$('button:has-text("Ruthless"), button:has-text("Mass Producer"), button:has-text("Trade Magnate")');
    for (let i = 0; i < Math.min(2, traitButtons.length); i++) {
      await traitButtons[i].click();
      console.log(`Selected trait ${i + 1}`);
    }

    // Look for a "Start" or "Begin" or "Continue" button
    const startBtn = await page.$('button:has-text("Start"), button:has-text("Begin"), button:has-text("Launch"), button:has-text("Continue")');
    if (startBtn) {
      await startBtn.click();
      console.log('Clicked start button');
      await page.waitForTimeout(2000);
    }
  }

  console.log('\n--- Current page content after setup ---');
  const bodyText2 = await page.innerText('body');
  console.log(bodyText2.substring(0, 3000));

  console.log('\n--- Looking for planet elements ---');
  const planetHeader = await page.$('text=Your Planets');
  console.log('Your Planets header:', !!planetHeader);

  const noplanets = await page.$('text=No planets found');
  console.log('No planets error:', !!noplanets);

  const failedLoad = await page.$('text=Failed to load');
  console.log('Failed to load error:', !!failedLoad);

  const planetCards = await page.$$('[class*="rounded-lg"][class*="border"]');
  console.log('Card-like elements:', planetCards.length);

  // Check for the planets tab
  const planetsTab = await page.$('text=Planets');
  console.log('Planets tab:', !!planetsTab);

  if (planetsTab) {
    await planetsTab.click();
    await page.waitForTimeout(1000);
    console.log('\n--- After clicking Planets tab ---');
    const bodyText3 = await page.innerText('body');
    console.log(bodyText3.substring(0, 3000));
  }

  console.log('\n--- Console logs ---');
  for (const log of consoleLogs) {
    console.log(log);
  }

  console.log('\n--- Page errors ---');
  for (const err of pageErrors) {
    console.log(err);
  }

  // Screenshot
  await page.screenshot({ path: '/tmp/planet-debug.png', fullPage: true });
  console.log('\n--- Screenshot saved to /tmp/planet-debug.png ---');

} catch (err) {
  console.error('Playwright error:', err);
} finally {
  await browser.close();
}
