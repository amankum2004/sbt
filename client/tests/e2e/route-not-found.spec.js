import { test, expect } from "@playwright/test";

test("shows Error page for unknown routes and allows navigation back home", async ({ page }) => {
  await page.goto("/this-route-should-not-exist");

  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.getByText("404")).toBeVisible();

  await page.getByRole("link", { name: "Return to Home" }).click();
  await expect(page).toHaveURL(/\/$/);
});
