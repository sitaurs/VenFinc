import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

// Fixed local preview. No deployment or external provider requests.
const base = 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1211, height: 867 } });
  page.on('pageerror', error => errors.push(error.message));
  const response = await page.goto(`${base}/demo`);
  assert.equal(response.status(), 200);
  assert.match(response.headers()['content-security-policy'], /default-src 'self'/);
  await page.getByRole('heading', { name: 'Demo interaktif', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'qa/screenshots/production-demo-web.png', fullPage: true });
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.waitForLoadState('networkidle');
  const cachedUrls = await page.evaluate(async () => {
    const names = await globalThis.caches.keys();
    return (await Promise.all(names.map(async name => (await (await globalThis.caches.open(name)).keys()).map(request => new URL(request.url).pathname)))).flat();
  });
  const privateCacheEntries = cachedUrls.filter(path => /^\/(api|app|admin|system)(\/|$)/.test(path));
  assert.deepEqual(privateCacheEntries, []);
  const api = await page.goto(`${base}/api/v1/me`);
  assert.equal(api.status(), 401);
  assert.match(api.headers()['content-type'], /application\/json/);
  assert.match(api.headers()['cache-control'], /no-store/);
  const apiBody = await api.json();
  assert.equal(apiBody.error.code, 'AUTH_REQUIRED');
  await page.goto(`${base}/demo`);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Catat', exact: true }).click();
  await page.getByLabel('Nominal rupiah', { exact: true }).fill('10000');
  await page.screenshot({ path: 'qa/screenshots/production-form-mobile.png' });
  await page.getByRole('dialog').getByRole('button', { name: 'Catat contoh', exact: true }).click();
  assert.equal(await page.locator('.balance-card .balance-value').innerText(), 'Rp640.000');
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await page.goto(`${base}/app`);
  await page.waitForURL('**/login');
  await page.getByText('Akses akun belum dibuka', { exact: true }).waitFor();
  assert.deepEqual(errors, []);
  const report = { status: 'PASS', scope: 'Local built Worker/assets, CSP, service-worker boundary, mobile sample entry and private-route denial only', errors, cachedUrls, privateCacheEntries, apiStatus: api.status(), apiCode: apiBody.error.code, mobileSampleBalanceAfter: '640000', productionDeployed: false };
  await writeFile('qa/built-preview-evidence.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} catch (error) {
  const report = { status: 'FAIL', scope: 'Local built preview only', reason: error instanceof Error ? error.message : 'Unknown error', productionDeployed: false };
  await writeFile('qa/built-preview-evidence.json', JSON.stringify(report, null, 2) + '\n');
  console.error(JSON.stringify(report));
  process.exitCode = 1;
} finally { await browser.close(); }
