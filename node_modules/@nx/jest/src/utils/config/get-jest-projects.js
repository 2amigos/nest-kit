"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNestedJestProjects = exports.getJestProjects = void 0;
const path_1 = require("path");
const file_utils_1 = require("nx/src/project-graph/file-utils");
function getJestConfigProjectPath(projectJestConfigPath) {
    return (0, path_1.join)('<rootDir>', projectJestConfigPath);
}
/**
 * Get a list of paths to all the jest config files
 * using the Nx Jest executor.
 *
 * This is used to configure Jest multi-project support.
 *
 * To add a project not using the Nx Jest executor:
 * export default {
 *   projects: [...getJestProjects(), '<rootDir>/path/to/jest.config.ts'];
 * }
 *
 **/
function getJestProjects() {
    var _a;
    const ws = (0, file_utils_1.readWorkspaceConfig)({
        format: 'nx',
    });
    const jestConfigurationSet = new Set();
    for (const projectConfig of Object.values(ws.projects)) {
        if (!projectConfig.targets) {
            continue;
        }
        for (const targetConfiguration of Object.values(projectConfig.targets)) {
            if (targetConfiguration.executor !== '@nx/jest:jest' &&
                targetConfiguration.executor !== '@nrwl/jest:jest') {
                continue;
            }
            if ((_a = targetConfiguration.options) === null || _a === void 0 ? void 0 : _a.jestConfig) {
                jestConfigurationSet.add(getJestConfigProjectPath(targetConfiguration.options.jestConfig));
            }
            if (targetConfiguration.configurations) {
                for (const configurationObject of Object.values(targetConfiguration.configurations)) {
                    if (configurationObject.jestConfig) {
                        jestConfigurationSet.add(getJestConfigProjectPath(configurationObject.jestConfig));
                    }
                }
            }
        }
    }
    return Array.from(jestConfigurationSet);
}
exports.getJestProjects = getJestProjects;
/**
 * a list of nested projects that have jest configured
 * to be used in the testPathIgnorePatterns property of a given jest config
 * https://jestjs.io/docs/configuration#testpathignorepatterns-arraystring
 * */
function getNestedJestProjects() {
    // TODO(caleb): get current project path and list of all projects and their rootDir
    // return a list of all projects that are nested in the current projects path
    // always include node_modules as that's the default
    const allProjects = getJestProjects();
    return ['/node_modules/'];
}
exports.getNestedJestProjects = getNestedJestProjects;
