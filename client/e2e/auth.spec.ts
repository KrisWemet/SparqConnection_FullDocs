import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to sign up and login', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Fill signup form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!');
    await page.fill('[data-testid="confirm-password-input"]', 'Test123!');
    
    // Submit form
    await page.click('[data-testid="signup-submit"]');
    
    // Verify redirect to login
    await expect(page).toHaveURL('/login');
    
    // Fill login form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!');
    
    // Submit login form
    await page.click('[data-testid="login-submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-profile"]')).toBeVisible();
  });
}); 