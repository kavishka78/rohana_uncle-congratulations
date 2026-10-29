import { test, expect } from '@playwright/test';
test('opens the greeting, displays personal fallback and replays', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /a special surprise/i })).toBeVisible();
  await page.getByRole('button', { name: /open your surprise/i }).click();
  await expect(page.getByRole('heading', { name: /Congratulations/ })).toBeVisible();
  await expect(page.getByText('Original crossover study')).toBeVisible();
  await expect(page.locator('.portrait-name')).toHaveText('ROHANA');
  await page.getByRole('button', { name: 'Explore the car' }).click();
  await expect(page.locator('#showroom')).toBeInViewport();
  const rotate = page.getByRole('button', { name: 'Rotate the model' });
  if (await rotate.isEnabled()) { await rotate.click(); await expect(page.getByRole('button', { name: 'Pause rotation' })).toHaveAttribute('aria-pressed', 'true'); }
  expect(await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Replay the surprise' }).click();
  await expect(page.getByRole('button', { name: /open your surprise/i })).toBeFocused();
  expect(errors).toEqual([]);
});
test('reduced motion and unavailable WebGL remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { const original = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type: string, ...args: unknown[]) { if (type.startsWith('webgl')) return null; return original.apply(this, [type, ...args] as never); } as typeof original; });
  await page.goto('/');
  await page.getByRole('button', { name: /open your surprise/i }).click();
  await expect(page.getByText('Interactive 3D is unavailable')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rotate the model' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: /Made especially/ })).toBeVisible();
});
