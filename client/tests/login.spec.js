// import { test, expect } from '@playwright/test';

// test.use({ storageState: 'storage/auth.json' });

// test.describe('Home Page Navigation', () => {

//   test('Home Dashboard', async ({ page }) => {
//     await page.goto('/');
//     await page.getByRole('link', { name: 'Home' }).click();
//     await page.getByRole('link', { name: 'About' }).first().click();
//     await page.getByRole('link', { name: 'Services' }).first().click();
//     await page.getByRole('link', { name: 'Contact' }).first().click();
//     await page.getByRole('link', { name: 'Home' }).click();
//   });
// });
                                

// test('login-check', async ({ page }) => {
//   await page.goto('/');
//   await page.getByRole('link', { name: 'Home' }).click();
//   await page.getByRole('link', { name: 'About' }).first().click();
//   await page.getByRole('link', { name: 'Services' }).first().click();
//   await page.getByRole('link', { name: 'Contact' }).first().click();
//   await page.getByRole('link', { name: 'Login', exact: true }).click();
//   await page.getByRole('button', { name: 'Phone' }).click();
//   await page.getByRole('textbox', { name: '0123456789' }).click();
//   await page.getByRole('textbox', { name: '0123456789' }).fill('8810269376');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('1234');
//   await page.getByRole('textbox', { name: 'Password' }).press('Enter');
// });


// test('invalid-login-check', async ({ page }) => {
//   await page.goto('/');
//   await page.getByRole('link', { name: 'Login', exact: true }).click();
//   await page.getByRole('button', { name: 'Phone' }).click();
//   await page.getByText('EmailPhone').click();
//   await page.getByText('EmailPhone').click();
//   await page.getByRole('textbox', { name: '0123456789' }).click();
//   await page.getByRole('textbox', { name: '0123456789' }).fill('8810269376');
//   await page.getByRole('textbox', { name: '0123456789' }).press('Tab');
//   await page.getByRole('textbox', { name: 'Password' }).fill('12345');
//   await page.getByRole('textbox', { name: 'Password' }).press('Enter');
//   await page.getByRole('button', { name: 'OK' }).click();
// });