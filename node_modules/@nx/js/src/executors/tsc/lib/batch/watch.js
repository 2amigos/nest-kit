"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchTaskProjectsFileChangesForAssets = exports.watchTaskProjectsPackageJsonFileChanges = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const client_1 = require("nx/src/daemon/client/client");
const path_1 = require("path");
function watchTaskProjectsPackageJsonFileChanges(taskInfos, callback) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projects = [];
        const packageJsonTaskInfoMap = new Map();
        taskInfos.forEach((t) => {
            projects.push(t.context.projectName);
            packageJsonTaskInfoMap.set((0, path_1.join)(t.options.projectRoot, 'package.json'), t);
        });
        const unregisterFileWatcher = yield client_1.daemonClient.registerFileWatcher({ watchProjects: projects }, (err, data) => {
            var _a;
            if (err === 'closed') {
                devkit_1.logger.error(`Watch error: Daemon closed the connection`);
                process.exit(1);
            }
            else if (err) {
                devkit_1.logger.error(`Watch error: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : 'Unknown'}`);
            }
            else {
                const changedTasks = [];
                data.changedFiles.forEach((file) => {
                    if (packageJsonTaskInfoMap.has(file.path)) {
                        changedTasks.push(packageJsonTaskInfoMap.get(file.path));
                    }
                });
                if (changedTasks.length) {
                    callback(changedTasks);
                }
            }
        });
        return () => unregisterFileWatcher();
    });
}
exports.watchTaskProjectsPackageJsonFileChanges = watchTaskProjectsPackageJsonFileChanges;
function watchTaskProjectsFileChangesForAssets(taskInfos) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const unregisterFileWatcher = yield client_1.daemonClient.registerFileWatcher({
            watchProjects: taskInfos.map((t) => t.context.projectName),
            includeDependentProjects: true,
            includeGlobalWorkspaceFiles: true,
        }, (err, data) => {
            var _a;
            if (err === 'closed') {
                devkit_1.logger.error(`Watch error: Daemon closed the connection`);
                process.exit(1);
            }
            else if (err) {
                devkit_1.logger.error(`Watch error: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : 'Unknown'}`);
            }
            else {
                taskInfos.forEach((t) => t.assetsHandler.processWatchEvents(data.changedFiles));
            }
        });
        return () => unregisterFileWatcher();
    });
}
exports.watchTaskProjectsFileChangesForAssets = watchTaskProjectsFileChangesForAssets;
