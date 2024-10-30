"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const executor_options_utils_1 = require("@nx/devkit/src/generators/executor-options-utils");
const path_1 = require("path");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        // Since projects can have multiple configurations, we need to know if the default options
        // need to be migrated or not. If so then the subsequent configurations with `webpackConfig` also need to be.
        const defaultOptionsUpdated = new Set();
        (0, executor_options_utils_1.forEachExecutorOptions)(tree, '@nrwl/webpack:webpack', (options, projectName, targetName, configurationName) => {
            var _a;
            const projectConfiguration = (0, devkit_1.readProjectConfiguration)(tree, projectName);
            const defaultOptions = projectConfiguration.targets[targetName].options;
            const defaultWasUpdated = defaultOptionsUpdated.has(projectName);
            // If default was not updated (for different configurations), we don't do anything
            // If isolatedConfig is set, we don't need to do anything
            // If project is React, we don't need to do anything
            if (!defaultWasUpdated &&
                ((defaultOptions === null || defaultOptions === void 0 ? void 0 : defaultOptions.isolatedConfig) ||
                    ((_a = defaultOptions === null || defaultOptions === void 0 ? void 0 : defaultOptions.main) === null || _a === void 0 ? void 0 : _a.match(/main\.(t|j)sx$/)) ||
                    (defaultOptions === null || defaultOptions === void 0 ? void 0 : defaultOptions.webpackConfig) === '@nrwl/react/plugins/webpack')) {
                return;
            }
            defaultOptionsUpdated.add(projectName);
            // If this is not the base options (e.g. for development, production, or something custom),
            // then skip it unless it specifically configures a webpackConfig file
            if (configurationName && !(options === null || options === void 0 ? void 0 : options.webpackConfig)) {
                return;
            }
            // If webpackConfig is set, update it with the new options
            // If webpackConfig is not set, we need to create a new
            // webpack.config.js file and set the path to it in the
            // executor options
            if (options === null || options === void 0 ? void 0 : options.webpackConfig) {
                let oldName = options.webpackConfig;
                if (options.webpackConfig.endsWith('.js')) {
                    oldName = options.webpackConfig.replace('.js', '.old.js');
                }
                if (options.webpackConfig.endsWith('.ts')) {
                    oldName = options.webpackConfig.replace('.ts', '.old.ts');
                }
                renameFile(tree, options.webpackConfig, oldName);
                const justTheFileName = (0, path_1.basename)(oldName);
                tree.write(options.webpackConfig, `
        const { composePlugins, withNx } = require('@nrwl/webpack');

        // Nx plugins for webpack.
        module.exports = composePlugins(withNx(), (config, { options, context }) => {
          // Note: This was added by an Nx migration.
          // You should consider inlining the logic into this file.
          // For more information on webpack config and Nx see:
          // https://nx.dev/packages/webpack/documents/webpack-config-setup
          return require('./${justTheFileName}')(config, context);
        });
        `);
                options.isolatedConfig = true;
                projectConfiguration.targets[targetName][configurationName !== null && configurationName !== void 0 ? configurationName : 'options'] = options;
                (0, devkit_1.updateProjectConfiguration)(tree, projectName, projectConfiguration);
                devkit_1.logger.info(`
          ${options.webpackConfig} has been renamed to ${oldName} and a new ${options.webpackConfig} 
          has been created for your project ${projectName}. 
          You should consider inlining the logic from ${oldName} into ${options.webpackConfig}.
          You can read our guide on how to do this here: 
          
          https://nx.dev/packages/webpack/documents/webpack-config-setup
          `);
            }
            else {
                const projectConfiguration = (0, devkit_1.readProjectConfiguration)(tree, projectName);
                if (!options) {
                    options = {};
                }
                options.webpackConfig = `${projectConfiguration.root}/webpack.config.js`;
                options.isolatedConfig = true;
                tree.write(options.webpackConfig, `
        const { composePlugins, withNx } = require('@nrwl/webpack');
      
        // Nx plugins for webpack.
        module.exports = composePlugins(withNx(), (config) => {
          // Update the webpack config as needed here.
          // e.g. config.plugins.push(new MyPlugin())
          // For more information on webpack config and Nx see:
          // https://nx.dev/packages/webpack/documents/webpack-config-setup
          return config;
        });
        `);
                projectConfiguration.targets[targetName].options = options;
                (0, devkit_1.updateProjectConfiguration)(tree, projectName, projectConfiguration);
            }
        });
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.default = default_1;
function renameFile(tree, from, to) {
    const buffer = tree.read(from);
    if (!buffer) {
        return;
    }
    tree.write(to, buffer);
    tree.delete(from);
}
