import { test, expect, Page } from '@playwright/test';

/**
 * Dashboard E2E tests.
 *
 * These tests verify that protected routes are properly gated
 * and that the dashboard renders key UI elements for authenticated users.
 *
 * Authenticated tests require the dev server to be running with a seeded workspace.
 * They are marked as skipped by default — remove `.skip` once auth helpers are set up.
 */

test.describe('Dashboard — access guard', () => {
  test('redirects /dashboard to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  // Dynamic workspace routes should also require auth
  test('redirects workspace route to login when not authenticated', async ({ page }) => {
    await page.goto('/some-workspace/projects');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Dashboard — UI smoke tests', () => {
  // Skip until auth fixture / seeded test user is set up in CI
  // Remove `.skip` and provide an `authFile` storageState to run these.
  test.skip('dashboard shows key metric cards', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/revenue/i)).toBeVisible();
    await expect(page.getByText(/active projects/i)).toBeVisible();
    await expect(page.getByText(/active clients/i)).toBeVisible();
  });

  test.skip('dashboard has a functioning navigation sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('navigation')).toBeVisible();
    // Verify key nav links exist
    await expect(page.getByRole('link', { name: /projects/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /invoices/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /clients/i })).toBeVisible();
  });

  test.skip('invoice page renders invoice table', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: /invoice/i })).toBeVisible();
  });

  test.skip('projects page renders kanban or list view', async ({ page }) => {
    await page.goto('/projects');
    // Either a table, kanban column, or empty state must be visible
    const content = page.locator('[data-testid="projects-view"], table, [data-testid="empty-state"]');
    await expect(content.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('API health', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({ status: 'ok' });
  });
});
