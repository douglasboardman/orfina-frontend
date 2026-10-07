import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test.describe('Administrative access with real API and persisted sessions', () => {
  test.skip(!process.env.ORFINA_QA_SESSION_FILE, 'Requires isolated backend and private fictional QA sessions');
  const api = 'http://127.0.0.1:3101/api';
  async function fixture(page: import('@playwright/test').Page, kind = 'admin') {
    const sessions = JSON.parse(readFileSync(process.env.ORFINA_QA_SESSION_FILE!, 'utf8')) as Record<string, { token: string; csrf: string; userId: string }>;
    const session = sessions[kind];
    await page.addInitScript((url) => { (globalThis as typeof globalThis & { ORFINA_API_URL?: string }).ORFINA_API_URL = url; }, api);
    await page.context().addCookies([
      { name: 'orfina_session', value: session.token, domain: '127.0.0.1', path: '/api', httpOnly: true, sameSite: 'Lax' },
      { name: 'orfina_csrf', value: session.csrf, domain: '127.0.0.1', path: '/', sameSite: 'Lax' },
    ]);
  }
  test('admin without household authorizes, disables, enables and audits access', async ({ page }) => {
    await fixture(page);
    const requests: string[] = []; page.on('request', (request) => requests.push(request.url()));
    await page.goto('/admin/acessos');
    await expect(page.getByRole('heading', { name: 'Acessos', exact: true })).toBeVisible();
    expect(requests.some((url) => url.includes('/households'))).toBe(false);
    await page.getByRole('link', { name: '+ Autorizar e-mail' }).click();
    const email = `qa-entry-${Date.now()}-${test.info().project.name}@gmail.com`;
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('E-mail', { exact: true }).fill(email);
    await dialog.getByLabel('Motivo (opcional)').fill('QA fictional beta invitation');
    await dialog.getByRole('button', { name: 'Autorizar acesso', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.getByLabel('Buscar nome ou e-mail').fill(email);
    await page.getByRole('button', { name: 'Filtrar', exact: true }).click();
    await page.getByRole('link', { name: '+ Autorizar e-mail' }).click();
    await dialog.getByLabel('E-mail', { exact: true }).fill(email);
    await dialog.getByRole('button', { name: 'Autorizar acesso', exact: true }).click();
    await expect(dialog.getByRole('link', { name: 'Consultar acesso já cadastrado' })).toBeVisible();
    await dialog.getByRole('link', { name: 'Consultar acesso já cadastrado' }).click();
    await expect(dialog.getByText(email, { exact: true }).first()).toBeVisible();
    await dialog.getByRole('button', { name: 'Desabilitar acesso', exact: true }).click();
    await dialog.getByLabel('Motivo (obrigatório)').fill('QA access removal');
    await dialog.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expect(dialog.getByText('Alteração confirmada.', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Desabilitado', { exact: true })).toBeVisible();
    await dialog.getByRole('button', { name: 'Habilitar acesso', exact: true }).click();
    await dialog.getByRole('button', { name: 'Confirmar', exact: true }).click();
    await expect(dialog.getByText('Habilitado', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    if (test.info().project.name === 'mobile') { await page.getByRole('button', { name: 'Abrir navegação' }).click(); await page.getByRole('dialog').getByRole('link', { name: 'Auditoria' }).click(); }
    else await page.getByRole('link', { name: 'Auditoria', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Auditoria', exact: true })).toBeVisible();
    await expect(page.locator('article').getByText('Acesso desabilitado', { exact: true }).first()).toBeVisible();
  });
  test('common user cannot open the administrative deep link', async ({ page }) => {
    await fixture(page, 'member'); await page.goto('/admin/acessos');
    await expect(page.getByRole('heading', { name: 'Acesso restrito', exact: true })).toBeVisible();
  });
  test('responsive layout, theme and keyboard dialog preserve essential actions', async ({ page }) => {
    await fixture(page); await page.goto('/admin/acessos');
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.getByRole('link', { name: '+ Autorizar e-mail' })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (test.info().project.name === 'desktop') await page.screenshot({ path: `output/playwright/delivery11/admin-${width}.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'Alternar tema' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /dark|light/);
    await page.getByRole('link', { name: '+ Autorizar e-mail' }).click();
    await expect(page.getByRole('dialog').getByLabel('E-mail', { exact: true })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement?.closest('dialog')))).toBe(true);
    await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
