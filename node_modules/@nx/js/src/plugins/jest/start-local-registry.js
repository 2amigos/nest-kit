"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLocalRegistry = void 0;
const child_process_1 = require("child_process");
/**
 * This function is used to start a local registry for testing purposes.
 * @param localRegistryTarget the target to run to start the local registry e.g. workspace:local-registry
 * @param storage the storage location for the local registry
 * @param verbose whether to log verbose output
 */
function startLocalRegistry({ localRegistryTarget, storage, verbose, }) {
    if (!localRegistryTarget) {
        throw new Error(`localRegistryTarget is required`);
    }
    return new Promise((resolve, reject) => {
        var _a, _b;
        const childProcess = (0, child_process_1.fork)(require.resolve('nx'), [
            ...`run ${localRegistryTarget} --location none --clear true`.split(' '),
            ...(storage ? [`--storage`, storage] : []),
        ], { stdio: 'pipe' });
        const listener = (data) => {
            var _a, _b, _c;
            if (verbose) {
                process.stdout.write(data);
            }
            if (data.toString().includes('http://localhost:')) {
                const port = parseInt((_b = (_a = data.toString().match(/localhost:(?<port>\d+)/)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.port);
                console.log('Local registry started on port ' + port);
                const registry = `http://localhost:${port}`;
                process.env.npm_config_registry = registry;
                (0, child_process_1.execSync)(`npm config set //localhost:${port}/:_authToken "secretVerdaccioToken"`);
                // yarnv1
                process.env.YARN_REGISTRY = registry;
                // yarnv2
                process.env.YARN_NPM_REGISTRY_SERVER = registry;
                process.env.YARN_UNSAFE_HTTP_WHITELIST = 'localhost';
                console.log('Set npm and yarn config registry to ' + registry);
                resolve(() => {
                    childProcess.kill();
                    (0, child_process_1.execSync)(`npm config delete //localhost:${port}/:_authToken`);
                });
                (_c = childProcess === null || childProcess === void 0 ? void 0 : childProcess.stdout) === null || _c === void 0 ? void 0 : _c.off('data', listener);
            }
        };
        (_a = childProcess === null || childProcess === void 0 ? void 0 : childProcess.stdout) === null || _a === void 0 ? void 0 : _a.on('data', listener);
        (_b = childProcess === null || childProcess === void 0 ? void 0 : childProcess.stderr) === null || _b === void 0 ? void 0 : _b.on('data', (data) => {
            process.stderr.write(data);
        });
        childProcess.on('error', (err) => {
            console.log('local registry error', err);
            reject(err);
        });
        childProcess.on('exit', (code) => {
            console.log('local registry exit', code);
            if (code !== 0) {
                reject(code);
            }
            else {
                resolve(() => { });
            }
        });
    });
}
exports.startLocalRegistry = startLocalRegistry;
exports.default = startLocalRegistry;
