"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWorkspace = void 0;
const devkit_1 = require("@nx/devkit");
function updateWorkspace(tree, options) {
    var _a;
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    projectConfig.targets.test = {
        executor: '@nx/jest:jest',
        outputs: [
            options.rootProject
                ? (0, devkit_1.joinPathFragments)('{workspaceRoot}', 'coverage', '{projectName}')
                : (0, devkit_1.joinPathFragments)('{workspaceRoot}', 'coverage', '{projectRoot}'),
        ],
        options: {
            jestConfig: (0, devkit_1.joinPathFragments)((0, devkit_1.normalizePath)(projectConfig.root), `jest.config.${options.js ? 'js' : 'ts'}`),
            passWithNoTests: true,
        },
        configurations: {
            ci: {
                ci: true,
                codeCoverage: true,
            },
        },
    };
    const isUsingTSLint = ((_a = projectConfig.targets.lint) === null || _a === void 0 ? void 0 : _a.executor) ===
        '@angular-devkit/build-angular:tslint';
    if (isUsingTSLint) {
        projectConfig.targets.lint.options.tsConfig = [
            ...(projectConfig.targets.lint.options.tsConfig || []),
            (0, devkit_1.joinPathFragments)((0, devkit_1.normalizePath)(projectConfig.root), 'tsconfig.spec.json'),
        ];
    }
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, projectConfig);
}
exports.updateWorkspace = updateWorkspace;
