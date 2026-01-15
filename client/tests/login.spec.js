import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.salonhub.co.in/');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'About' }).first().click();
  await page.getByRole('link', { name: 'Services' }).first().click();
  await page.getByRole('link', { name: 'Contact' }).first().click();
  await page.getByRole('link', { name: 'Home' }).click();
});


test('Owner profile', async ({ page }) => {
  await page.goto('https://www.salonhub.co.in/');
  await page.getByRole('button', { name: 'Book Salon Appointment Now' }).click();
  await page.getByRole('button', { name: 'Phone' }).click();
  await page.getByRole('textbox', { name: '0123456789' }).click();
  await page.getByRole('textbox', { name: '0123456789' }).fill('8810269376');
  await page.getByRole('textbox', { name: '0123456789' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('1234');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'Dashboard' }).click();
  await page.getByRole('img', { name: 'User Avatar' }).first().click();
  await page.getByRole('link', { name: 'Profile' }).click();
  await page.getByRole('img', { name: 'User Avatar' }).first().click();
  await page.getByRole('link', { name: 'My bookings' }).click();
  await page.getByRole('button', { name: 'History (1)' }).click();
  await page.getByRole('img', { name: 'User Avatar' }).first().click();
  await page.getByRole('link', { name: 'Book appointment' }).click();
});

// import { test, expect } from '@playwright/test';

test('test-1', async ({ page }) => {
  await page.goto('https://www.salonhub.co.in/');
  await page.getByRole('link', { name: 'Home' }).click();
  await page.getByRole('link', { name: 'About' }).first().click();
  await page.getByRole('link', { name: 'Services' }).first().click();
  await page.getByRole('link', { name: 'Contact' }).first().click();
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('button', { name: 'Phone' }).click();
  await page.getByRole('textbox', { name: '0123456789' }).click();
  await page.getByRole('textbox', { name: '0123456789' }).fill('8810269376');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('1234');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
});

// import { test, expect } from '@playwright/test';

test('invalid-login', async ({ page }) => {
  await page.goto('https://www.salonhub.co.in/');
  await page.getByRole('link', { name: 'Login', exact: true }).click();
  await page.getByRole('button', { name: 'Phone' }).click();
  await page.getByText('EmailPhone').click();
  await page.getByText('EmailPhone').click();
  await page.getByRole('textbox', { name: '0123456789' }).click();
  await page.getByRole('textbox', { name: '0123456789' }).fill('8810269376');
  await page.getByRole('textbox', { name: '0123456789' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345');
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await page.getByRole('button', { name: 'OK' }).click();
});