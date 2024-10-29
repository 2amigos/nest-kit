"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedTypescriptVersions = exports.typescriptVersion = exports.verdaccioVersion = exports.typesNodeVersion = exports.tsLibVersion = exports.swcNodeVersion = exports.swcHelpersVersion = exports.swcCoreVersion = exports.swcCliVersion = exports.prettierVersion = exports.esbuildVersion = exports.nxVersion = void 0;
exports.nxVersion = require('../../package.json').version;
exports.esbuildVersion = '^0.17.17';
exports.prettierVersion = '^2.6.2';
exports.swcCliVersion = '~0.1.62';
exports.swcCoreVersion = '~1.3.51';
exports.swcHelpersVersion = '~0.5.0';
exports.swcNodeVersion = '~1.4.2';
exports.tsLibVersion = '^2.3.0';
exports.typesNodeVersion = '18.7.1';
exports.verdaccioVersion = '^5.0.4';
// Typescript
exports.typescriptVersion = '~5.1.3';
/**
 * The minimum version is currently determined from the lowest version
 * that's supported by the lowest Angular supported version, e.g.
 * `npm view @angular/compiler-cli@14.0.0 peerDependencies.typescript`
 */
exports.supportedTypescriptVersions = '>=4.6.2';
