import { test, expect } from '@playwright/test';

/**
 * Authentication E2E tests.
 *
 * Prerequisites:
 *  - Dev server running at http://localhost:3000
 *  - A seeded test user exists:
 *    email: test@synclancer.dev  /  password: TestPassword1!
 *
 * Set env vars to override:
 *  E2E_EMAIL, E2E_PASSWORD
 */

const EMAIL = process.env.E2E_EMAIL ?? 'test@synclancer.dev';
const PASSWORD = process.env.E2E_PASSWORD ?? 'TestPassword1!';

test.describe('Authentication', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    // Visiting a protected route should land on login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page renders required elements', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /sign in|log in|welcome/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in|continue/i })).toBeVisible();
  });

  test('shows validation error for empty submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();
    // Expect at least one error message visible
    await expect(
      page.locator('[role="alert"], .text-destructive, [data-error], p.text-red-500').first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();

    // Should stay on login and show an error
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.locator('text=/invalid|incorrect|credentials|error/i').first()
    ).toBeVisible({ timeout: 8000 });
  });

  test('navigates to register page from login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /sign up|register|create account/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('register page renders required elements', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /register|sign up|create/i })).toBeVisible();
  });

  test.skip('successful login redirects to dashboard', async ({ page }) => {
    // Requires a seeded test user — remove .skip once one exists
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(EMAIL);
    await page.getByLabel(/password/i).fill(PASSWORD);
    await page.getByRole('button', { name: /sign in|log in|continue/i }).click();
    await expect(page).not.toHaveURL(/\/login/);
  });
});
