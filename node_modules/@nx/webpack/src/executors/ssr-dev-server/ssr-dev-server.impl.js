"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssrDevServerExecutor = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const chalk = require("chalk");
const async_iterable_1 = require("@nx/devkit/src/utils/async-iterable");
const wait_until_server_is_listening_1 = require("./lib/wait-until-server-is-listening");
function ssrDevServerExecutor(options, context) {
    var _a, _b;
    return tslib_1.__asyncGenerator(this, arguments, function* ssrDevServerExecutor_1() {
        var _c, e_1, _d, _e;
        const browserTarget = (0, devkit_1.parseTargetString)(options.browserTarget, context.projectGraph);
        const serverTarget = (0, devkit_1.parseTargetString)(options.serverTarget, context.projectGraph);
        const browserOptions = (0, devkit_1.readTargetOptions)(browserTarget, context);
        const serverOptions = (0, devkit_1.readTargetOptions)(serverTarget, context);
        const runBrowser = yield tslib_1.__await((0, devkit_1.runExecutor)(browserTarget, Object.assign(Object.assign({}, browserOptions), options.browserTargetOptions), context));
        const runServer = yield tslib_1.__await((0, devkit_1.runExecutor)(serverTarget, Object.assign(Object.assign({}, serverOptions), options.serverTargetOptions), context));
        let browserBuilt = false;
        let nodeStarted = false;
        const combined = (0, async_iterable_1.combineAsyncIterables)(runBrowser, runServer);
        process.env['port'] = `${options.port}`;
        try {
            for (var _f = true, combined_1 = tslib_1.__asyncValues(combined), combined_1_1; combined_1_1 = yield tslib_1.__await(combined_1.next()), _c = combined_1_1.done, !_c; _f = true) {
                _e = combined_1_1.value;
                _f = false;
                const output = _e;
                if (!output.success)
                    throw new Error('Could not build application');
                if (((_a = output.options) === null || _a === void 0 ? void 0 : _a.target) === 'node') {
                    nodeStarted = true;
                }
                else if (((_b = output.options) === null || _b === void 0 ? void 0 : _b.target) === 'web') {
                    browserBuilt = true;
                }
                if (nodeStarted && browserBuilt) {
                    yield tslib_1.__await((0, wait_until_server_is_listening_1.waitUntilServerIsListening)(options.port));
                    console.log(`[ ${chalk.green('ready')} ] on http://localhost:${options.port}`);
                    yield yield tslib_1.__await(Object.assign(Object.assign({}, output), { baseUrl: `http://localhost:${options.port}` }));
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_c && (_d = combined_1.return)) yield tslib_1.__await(_d.call(combined_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.ssrDevServerExecutor = ssrDevServerExecutor;
exports.default = ssrDevServerExecutor;
