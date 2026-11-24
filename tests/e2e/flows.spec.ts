import { test, expect } from '@playwright/test';

test('palette draft survives reload and sign-in navigation without submitting', async ({ page }) => {
  await page.goto('/generate-palettes?colors=%23111111,%23222222,%23333333,%23444444,%23555555');
  await page.getByLabel('HEX code').fill('#ABCDEF');
  await page.getByLabel('Palette name').fill('Unfinished sunset');
  await page.getByLabel('Tags', { exact: false }).fill('warm, draft');
  await page.reload();
  await expect(page.getByLabel('Palette name')).toHaveValue('Unfinished sunset');
  await expect(page.getByLabel('Tags', { exact: false })).toHaveValue('warm, draft');
  await page.getByRole('link', { name: 'Sign in', exact: true }).click();
  await page.goto('/generate-palettes');
  await expect(page.getByLabel('Palette name')).toHaveValue('Unfinished sunset');
  await expect(page.getByLabel('HEX code')).toHaveValue('#ABCDEF');
});

test('discover, customize RGB, sign up, persist, sign back in, and delete a palette', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Color palettes for/ }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'View Rainbow colors palette', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('link', { name: 'Customize ↗' }).click();
  await expect(
    page.getByRole('heading', { name: 'Create your own color palette.' }),
  ).toBeVisible();
  await page.getByLabel('HEX code').fill('#FFB443');
  await expect(page.getByLabel('Red', { exact: true })).toHaveValue('255');
  await expect(page.getByLabel('Green', { exact: true })).toHaveValue('180');
  await page.getByLabel('Blue', { exact: true }).fill('70');
  await expect(page.getByLabel('HEX code')).toHaveValue('#FFB446');
  await page.getByLabel('Palette name').fill('Browser sunset');
  await page.getByLabel('Tags', { exact: false }).fill('sunset, browser');
  await page.getByRole('button', { name: 'Save palette ↗' }).click();
  await page.getByRole('link', { name: 'Sign up ↗', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Join the colorful side.' }),
  ).toBeVisible();
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Browser-test-123');
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill('Browser-test-123');
  await page.getByRole('button', { name: 'Create account ↗' }).click();
  await expect(page).toHaveURL(/\/generate-palettes(?:\?|$)/);
  await expect(page.getByLabel('Palette name')).toHaveValue('Browser sunset');
  await expect(page.getByLabel('HEX code')).toHaveValue('#FFB446');
  await page.getByRole('button', { name: 'Save palette ↗' }).click();
  await expect(page).toHaveURL(/my-palettes$/);
  await expect(
    page.getByRole('button', { name: 'View Browser sunset', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'View Browser sunset', exact: true }),
  ).toBeVisible();
  await page.getByRole('textbox', { name: 'Search collection', exact: true }).fill('not-my-palette');
  await page.getByRole('button', { name: 'Search collection', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No palettes found.' })).toBeVisible();
  await expect(page.getByText('Try a different name, mood, or HEX code.')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.goto('/my-palettes');
  await expect(page).toHaveURL(/signin/);
  await page.getByLabel('Email', { exact: true }).fill('browser@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Browser-test-123');
  await page.getByRole('button', { name: 'Sign in ↗', exact: true }).click();
  await expect(page).toHaveURL(/my-palettes$/);
  page.once('dialog', (dialog) => dialog.accept());
  await page
    .getByRole('button', { name: 'Delete Browser sunset', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your palette collection starts here.' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test('search query, sorting, dialog keyboard controls, and mobile navigation', async ({
  page,
}) => {
  await page.goto('/search-palettes?q=ocean');
  await expect(
    page.getByRole('button', { name: 'View Ocean daydream', exact: true }),
  ).toBeVisible();
  await expect(page.locator('app-palette-card')).toHaveCount(1);
  await page
    .getByRole('textbox', { name: 'Search collection', exact: true })
    .fill('#60A5FA');
  await page
    .getByRole('button', { name: 'Search collection', exact: true })
    .click();
  await expect(
    page.getByRole('button', {
      name: 'View Rainbow colors palette',
      exact: true,
    }),
  ).toBeVisible();
  await page.getByLabel('Sort by').selectOption('name');
  await page
    .getByRole('button', { name: 'View Rainbow colors palette', exact: true })
    .click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page
    .getByRole('textbox', { name: 'Search collection', exact: true })
    .fill('no-such-mood');
  await page
    .getByRole('button', { name: 'Search collection', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'No palettes found.' }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu ☰' }).click();
  await page
    .getByRole('navigation')
    .getByRole('link', { name: 'Color tools', exact: true })
    .click();
  await expect(page).toHaveURL(/generate-palettes/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: 'test-results/generator-mobile.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await page.screenshot({
    path: 'test-results/home-desktop.png',
    fullPage: true,
  });
});

test('validation errors, reset email configuration, and 404 remain visible', async ({
  page,
}) => {
  await page.goto('/signup');
  await page
    .getByLabel('Email', { exact: true })
    .fill('validation@example.com');
  await page
    .getByLabel('Password', { exact: true })
    .fill('Validation-test-123');
  await page
    .getByLabel('Confirm password', { exact: true })
    .fill('Does-not-match');
  await page.getByRole('button', { name: 'Create account ↗' }).click();
  await expect(page.getByRole('alert')).toHaveText('Passwords do not match.');
  await page.goto('/forgotpassword');
  await page
    .getByLabel('Email', { exact: true })
    .fill('validation@example.com');
  await page.getByRole('button', { name: 'Send reset link ↗' }).click();
  await expect(page.getByRole('alert')).toContainText('not configured');
  await page.goto('/not-a-real-page');
  await expect(
    page.getByRole('heading', { name: 'This color is off the canvas.' }),
  ).toBeVisible();
});
