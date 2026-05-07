import { test, expect } from '@playwright/test';

test.describe('Todo App E2E', () => {
  test.beforeEach(async ({ page, request }) => {
    await request.delete('/api/todos/reset');
    await page.goto('/');
  });

  test('shows empty state initially', async ({ page }) => {
    await expect(page.getByText(/no todos/i)).toBeVisible();
  });

  test('adds a new todo', async ({ page }) => {
    await page.getByLabel('Todo title').fill('Buy groceries');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Buy groceries')).toBeVisible();
  });

  test('adds a todo with due date and priority', async ({ page }) => {
    await page.getByLabel('Todo title').fill('Write report');
    await page.getByLabel('Due date').fill('2026-12-31');
    await page.getByLabel('Priority').selectOption('high');
    await page.getByRole('button', { name: /add/i }).click();

    await expect(page.getByText('Write report')).toBeVisible();
    await expect(page.getByText(/2026-12-31/)).toBeVisible();
    // Scope to the list item to avoid matching the <option> element in the form
    await expect(page.getByRole('listitem').getByText('high', { exact: true })).toBeVisible();
  });

  test('toggles a todo complete and back', async ({ page }) => {
    await page.getByLabel('Todo title').fill('Toggle me');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Toggle me')).toBeVisible();

    // Use click() + assert because this is a controlled React component —
    // the DOM update happens after the async fetch completes, not immediately.
    const titleSpan = page.getByRole('listitem').filter({ hasText: 'Toggle me' }).getByText('Toggle me');
    const checkbox = page.getByRole('checkbox', { name: /mark "Toggle me"/i });

    await checkbox.click();
    await expect(titleSpan).toHaveCSS('text-decoration-line', 'line-through');

    await checkbox.click();
    await expect(titleSpan).not.toHaveCSS('text-decoration-line', 'line-through');
  });

  test('filters Active and Completed', async ({ page }) => {
    // Add first todo and wait for it to appear before adding the second.
    // (Without waiting, the form's setTitle('') after submit races with the fill.)
    await page.getByLabel('Todo title').fill('Active task');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Active task')).toBeVisible();

    await page.getByLabel('Todo title').fill('Done task');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Done task')).toBeVisible();

    // Complete one
    await page.getByRole('checkbox', { name: /mark "Done task"/i }).click();
    await expect(
      page.getByRole('listitem').filter({ hasText: 'Done task' }).getByText('Done task')
    ).toHaveCSS('text-decoration-line', 'line-through');

    // Filter active
    await page.getByRole('tab', { name: 'Active' }).click();
    await expect(page.getByText('Active task')).toBeVisible();
    await expect(page.getByText('Done task')).not.toBeVisible();

    // Filter completed
    await page.getByRole('tab', { name: 'Completed' }).click();
    await expect(page.getByText('Done task')).toBeVisible();
    await expect(page.getByText('Active task')).not.toBeVisible();

    // Show all
    await page.getByRole('tab', { name: 'All' }).click();
    await expect(page.getByText('Active task')).toBeVisible();
    await expect(page.getByText('Done task')).toBeVisible();
  });

  test('deletes a todo', async ({ page }) => {
    await page.getByLabel('Todo title').fill('Delete me');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Delete me')).toBeVisible();

    await page.getByLabel(/delete "Delete me"/i).click();
    await expect(page.getByText('Delete me')).not.toBeVisible();
  });

  test('persists data on reload', async ({ page }) => {
    await page.getByLabel('Todo title').fill('Persist me');
    await page.getByRole('button', { name: /add/i }).click();
    await expect(page.getByText('Persist me')).toBeVisible();

    await page.reload();
    await expect(page.getByText('Persist me')).toBeVisible();
  });

  test('preserves filter in URL on reload', async ({ page }) => {
    await page.getByRole('tab', { name: 'Active' }).click();
    await expect(page).toHaveURL(/filter=active/);

    await page.reload();
    await expect(page.getByRole('tab', { name: 'Active' })).toHaveAttribute('aria-selected', 'true');
  });
});
