import { test, expect } from '@playwright/test';

test.describe('Dashboard Page Sections', () => {

  test.use({ storageState: 'storage/auth.json' });

  test(' Customer dashboard page Elements Check', async ({ page }) => {
    // Navigate
    await page.goto('/customerDashboard');
    await page.waitForLoadState('networkidle');

//     /* ---------------- Top / Global Controls ---------------- */

//     await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();

// // Dropdown popup SCOPE LIST(Syncfusion)
// const scopeFilter = page.locator('.e-multi-select-wrapper');
// await expect(scopeFilter).toBeVisible();
// await scopeFilter.click();     // open
// await page.keyboard.press('Escape'); // close


// // Verify label
// await expect(page.getByText('Last 15 Minutes')).toBeVisible();

// // Apply
// await page.getByRole('button', { name: /Apply/i }).click();

//     /* ---------------- Summary Sections ---------------- */

//     await expect(
//         page.locator('span.header-text.fw-bold', { hasText: 'Traffic Summary' })
//       ).toBeVisible();
      
//       await expect(
//         page.locator('span.header-text.fw-bold', { hasText: 'Flow Summary' })
//       ).toBeVisible();

//       await expect(
//         page.locator('span.header-text.fw-bold', { hasText: 'Detected Events' })
//       ).toBeVisible();

//       //dialog on events
//       const trafficInfoBtn = page
//   .locator('span.header-text', { hasText: 'Traffic Summary' })
//   .locator('..')
//   .locator('.blinking-circle');

// await trafficInfoBtn.click();
// await expect(page.locator('#trafficDialog')).toBeVisible();

//     /* ---------------- Metric Tabs ---------------- */

// const metricLabels = page.locator(
//   '.e-card > .row p.common-text.text-truncate'
// );

// await expect(metricLabels.filter({ hasText: 'Ingress Traffic' })).toBeVisible();
// await expect(metricLabels.filter({ hasText: 'Avg. Packet Rate (pps)' })).toBeVisible();
// await expect(metricLabels.filter({ hasText: 'Egress Traffic' })).toBeVisible();
// await expect(metricLabels.filter({ hasText: 'Active Flows' })).toBeVisible();
// await expect(metricLabels.filter({ hasText: 'Generated Flows (fps)' })).toBeVisible();
// await expect(metricLabels.filter({ hasText: 'Exported Flows (fps)' })).toBeVisible();

//     /* ---------------- Threat Distribution ---------------- */

//     await expect(page.getByText('Threat Distribution Summary')).toBeVisible();

//     // Verify gauges are rendered (DO NOT CLICK SVGs)
//     const gaugeCards = page.locator(
//         'span.header-text',
//         { hasText: 'Threat Distribution Summary' }
//       ).locator('..')
//        .locator('..')
//        .locator('ejs-circulargauge');
      
//       await expect(gaugeCards).toHaveCount(6);

//     /* ---------------- Organization Panels ---------------- */

//     await expect(page.getByText('TOP COMPROMISED/ATTACKING')).toBeVisible();
//     await expect(page.getByText('TOP VICTIMIZED INDIAN')).toBeVisible();

//     await expect(page.locator('#attackerOrganization')).toBeVisible();
//     await expect(page.locator('#victimOrganization')).toBeVisible();

//     /* ---------------- Country Analytics ---------------- */

//     await expect(page.getByText('COUNTRY WISE EVENTS')).toBeVisible();
//     await expect(page.getByText('TOP COUNTRIES ATTACKING INDIA')).toBeVisible();

//     await expect(page.locator('#countryDistribution')).toBeVisible();
//     await expect(page.locator('#country')).toBeVisible();
    
//     /* ---------------- Export / Dropdown Buttons ---------------- */

//     await expect(page.locator('#e-dropdown-btn_1')).toBeVisible();
//     await expect(page.locator('#e-dropdown-btn_2')).toBeVisible();
//     await expect(page.locator('#e-dropdown-btn_3')).toBeVisible();
//     await expect(page.locator('#e-dropdown-btn_4')).toBeVisible();
  });
});