"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLocalRegistryScripts = void 0;
const devkit_1 = require("@nx/devkit");
const startLocalRegistryScript = (localRegistryTarget) => `
/**
 * This script starts a local registry for e2e testing purposes.
 * It is meant to be called in jest's globalSetup.
 */
import { startLocalRegistry } from '@nx/js/plugins/jest/local-registry';
import { execFileSync } from 'child_process';

export default async () => {
  // local registry target to run
  const localRegistryTarget = '${localRegistryTarget}';
  // storage folder for the local registry
  const storage = './tmp/local-registry/storage';

  global.stopLocalRegistry = await startLocalRegistry({
    localRegistryTarget,
    storage,
    verbose: false,
  });
  const nx = require.resolve('nx');
  execFileSync(
    nx,
    ['run-many', '--targets', 'publish', '--ver', '1.0.0', '--tag', 'e2e'],
    { env: process.env, stdio: 'inherit' }
  );
};
`;
const stopLocalRegistryScript = `
/**
 * This script stops the local registry for e2e testing purposes.
 * It is meant to be called in jest's globalTeardown.
 */

export default () => {
  if (global.stopLocalRegistry) {
    global.stopLocalRegistry();
  }
};
`;
function addLocalRegistryScripts(tree) {
    const startLocalRegistryPath = 'tools/scripts/start-local-registry.ts';
    const stopLocalRegistryPath = 'tools/scripts/stop-local-registry.ts';
    const projectConfiguration = (0, devkit_1.readJson)(tree, 'project.json');
    const localRegistryTarget = `${projectConfiguration.name}:local-registry`;
    if (!tree.exists(startLocalRegistryPath)) {
        tree.write(startLocalRegistryPath, startLocalRegistryScript(localRegistryTarget));
    }
    if (!tree.exists(stopLocalRegistryPath)) {
        tree.write(stopLocalRegistryPath, stopLocalRegistryScript);
    }
    return { startLocalRegistryPath, stopLocalRegistryPath };
}
exports.addLocalRegistryScripts = addLocalRegistryScripts;
