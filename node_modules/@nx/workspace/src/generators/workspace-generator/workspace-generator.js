"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
function default_1(host, schema) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const message = (0, devkit_1.stripIndents) `Workspace Generators are no longer supported. Instead,
    Nx now supports executing generators or executors from local plugins. To get 
    started, install @nx/plugin and run \`nx g plugin\`.

    Afterwards, or if you already have an Nx plugin, you can run 
    \`nx g generator --project {my-plugin}\` to add a new generator.
    
    For more information, see: https://nx.dev/deprecated/workspace-generators`;
        throw new Error(message);
    });
}
exports.default = default_1;
