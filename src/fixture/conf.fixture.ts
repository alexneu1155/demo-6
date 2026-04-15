import { test as base } from '@playwright/test';
import { loadMergedConfig } from '../utils/conf';

/**
 * Playwright fixture: conf
 * Loads and merges config for each test based on test file, caseId (from @tag), and env.
 * 
 * Usage:
 *   import { test, expect } from '@fixtures/conf.fixture';
 *   test('my test @CASE_01', async ({ conf }) => {
 *     console.log(conf.username, conf.password);
 *   });
 */
export const test = base.extend<{ conf: any }>({
    conf: async ({}, use: any, testInfo: any) => {
        // Get test file path
        const testFilePath = testInfo.file;

        // Get caseId from test tag (e.g., @CREATE_01)
        let caseId = testInfo?.tags?.[0];
        if (!caseId) {
            throw new Error('Cannot determine caseId from test tags. Add a tag like @CASE_ID to your test: ' + testInfo.title);
        }

        // Remove @ prefix
        caseId = caseId.replace('@', '');

        // Get env from process.env or default to 'dev'
        const env = process.env.ENV || 'dev';

        // Load merged config
        const conf = loadMergedConfig(testFilePath, caseId, env);
        await use(conf);
    },
});

export { expect } from "@playwright/test";
