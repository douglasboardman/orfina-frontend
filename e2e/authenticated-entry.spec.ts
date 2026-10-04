import { expect, test } from '@playwright/test';

test('renders the anonymous entry without treating a missing session as an error', async ({ page }) => {
  await page.route('**/api/auth/me', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Unauthorized' }),
  }));
  await page.goto('/visao-geral');

  await expect(page.getByRole('heading', { name: 'Seu dinheiro, mais tranquilo.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeVisible();
  await expect(page.getByText('Não foi possível restaurar a sessão')).toHaveCount(0);
});
