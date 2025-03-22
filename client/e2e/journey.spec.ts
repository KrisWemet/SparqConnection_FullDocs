import { test, expect } from '@playwright/test';

test.describe('Journey Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'Test123!');
    await page.click('[data-testid="login-submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete a journey day', async ({ page }) => {
    // Navigate to journey
    await page.goto('/journey/current');
    
    // Start the day
    await page.click('[data-testid="begin-day"]');
    
    // Complete activities
    await page.click('[data-testid="activity-complete"]');
    
    // Navigate to reflection
    await page.click('[data-testid="continue-reflection"]');
    
    // Fill reflection
    await page.fill('[data-testid="reflection-input"]', 'This was a great experience!');
    await page.click('[data-testid="submit-reflection"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="day-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('1/5');
  });
}); 