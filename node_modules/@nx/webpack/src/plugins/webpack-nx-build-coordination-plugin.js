"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackNxBuildCoordinationPlugin = void 0;
const tslib_1 = require("tslib");
const chokidar_1 = require("chokidar");
const child_process_1 = require("child_process");
const devkit_1 = require("@nx/devkit");
const devkit_2 = require("@nx/devkit");
const ignore_1 = require("ignore");
const fs_1 = require("fs");
class WebpackNxBuildCoordinationPlugin {
    constructor(buildCmd, skipInitialBuild) {
        this.buildCmd = buildCmd;
        this.currentlyRunning = 'none';
        if (!skipInitialBuild) {
            this.buildChangedProjects();
        }
        this.startWatchingBuildableLibs();
    }
    apply(compiler) {
        compiler.hooks.beforeCompile.tapPromise('IncrementalDevServerPlugin', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            while (this.currentlyRunning === 'nx-build') {
                yield sleep(50);
            }
            this.currentlyRunning = 'webpack-build';
        }));
        compiler.hooks.done.tapPromise('IncrementalDevServerPlugin', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.currentlyRunning = 'none';
        }));
    }
    startWatchingBuildableLibs() {
        createFileWatcher(process.cwd(), () => {
            this.buildChangedProjects();
        });
    }
    buildChangedProjects() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            while (this.currentlyRunning === 'webpack-build') {
                yield sleep(50);
            }
            this.currentlyRunning = 'nx-build';
            try {
                (0, child_process_1.execSync)(this.buildCmd, { stdio: [0, 1, 2] });
                // eslint-disable-next-line no-empty
            }
            catch (e) { }
            this.currentlyRunning = 'none';
        });
    }
}
exports.WebpackNxBuildCoordinationPlugin = WebpackNxBuildCoordinationPlugin;
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
function getIgnoredGlobs(root) {
    const ig = (0, ignore_1.default)();
    try {
        ig.add((0, fs_1.readFileSync)(`${root}/.gitignore`, 'utf-8'));
    }
    catch (_a) { }
    try {
        ig.add((0, fs_1.readFileSync)(`${root}/.nxignore`, 'utf-8'));
    }
    catch (_b) { }
    return ig;
}
function createFileWatcher(root, changeHandler) {
    const ignoredGlobs = getIgnoredGlobs(root);
    const layout = (0, devkit_1.workspaceLayout)();
    const watcher = (0, chokidar_1.watch)([
        (0, devkit_2.joinPathFragments)(layout.appsDir, '**'),
        (0, devkit_2.joinPathFragments)(layout.libsDir, '**'),
    ], {
        cwd: root,
        ignoreInitial: true,
    });
    watcher.on('all', (_event, path) => {
        if (ignoredGlobs.ignores(path))
            return;
        changeHandler();
    });
    return { close: () => watcher.close() };
}
