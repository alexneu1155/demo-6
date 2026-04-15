import path from "path";
import fs from "fs";
import merge from "lodash.merge";

/**
 * Loads and merges configuration from multiple levels:
 * 1. Global common config (src/data/global.json → common.suite_config)
 * 2. Global env-specific config (src/data/global.json → by_env.[env].suite_config)
 * 3. Local common suite config (test-name.json → common.suite_config)
 * 4. Local common case config (test-name.json → common.case_config.[caseId])
 * 5. Local env suite config (test-name.json → by_env.[env].suite_config)
 * 6. Local env case config (test-name.json → by_env.[env].case_config.[caseId])
 *
 * Priority increases from 1 → 6 (later overrides earlier).
 */
export const loadMergedConfig = (
    testFilePath: string,
    caseId: string,
    env: string
): any => {
    // ── 1. Load global config ──
    let globalCommonConf: Record<string, any> = {};
    let globalByEnvConf: Record<string, any> = {};

    const globalDataFile = path.join("src/data", "global.json");
    if (fs.existsSync(globalDataFile)) {
        const globalData = JSON.parse(fs.readFileSync(globalDataFile, "utf-8"));
        globalCommonConf = globalData?.common?.suite_config || {};
        globalByEnvConf = globalData?.by_env?.[env]?.suite_config || {};
    }

    // ── 2. Load local config (same name as the test file, .json extension) ──
    const testDir = path.dirname(testFilePath);
    const testBase = path.basename(testFilePath, ".spec.ts");
    const jsonFile = path.join(testDir, `${testBase}.json`);

    let commonSuiteConf: Record<string, any> = {};
    let commonCaseConf: Record<string, any> = {};
    let envSuiteConf: Record<string, any> = {};
    let envCaseConf: Record<string, any> = {};

    if (fs.existsSync(jsonFile)) {
        const configRaw = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
        commonSuiteConf = configRaw?.common?.suite_config || {};
        commonCaseConf = configRaw?.common?.case_config?.[caseId] || {};
        envSuiteConf = configRaw?.by_env?.[env]?.suite_config || {};
        envCaseConf = configRaw?.by_env?.[env]?.case_config?.[caseId] || {};
    }

    // ── 3. Merge in priority order (later overrides earlier) ──
    const merged = {};
    merge(merged, globalCommonConf);
    merge(merged, globalByEnvConf);
    merge(merged, commonSuiteConf);
    merge(merged, commonCaseConf);
    merge(merged, envSuiteConf);
    merge(merged, envCaseConf);

    if (Object.keys(merged).length === 0) {
        throw new Error(
            `No config found for case '${caseId}' in file ${jsonFile} (env: ${env})`
        );
    }

    return merged;
};
