import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://localhost:4300', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node tests/start-server.mjs',
      url: 'http://127.0.0.1:3000/api/health',
      timeout: 120000,
    },
    {
      command: 'npm run dev -- --port 4300',
      url: 'http://localhost:4300',
      timeout: 120000,
    },
  ],
});
