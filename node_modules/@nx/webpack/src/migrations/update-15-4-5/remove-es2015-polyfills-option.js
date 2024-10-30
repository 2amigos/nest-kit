"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const projects = (0, devkit_1.getProjects)(tree);
        projects.forEach((p) => {
            let shouldUpdate = false;
            Object.entries(p.targets).forEach(([name, config]) => {
                var _a, _b, _c, _d, _e, _f;
                if (((_b = (_a = p.targets) === null || _a === void 0 ? void 0 : _a[name]) === null || _b === void 0 ? void 0 : _b.executor) === '@nrwl/webpack:webpack' &&
                    ((_d = (_c = p.targets) === null || _c === void 0 ? void 0 : _c[name]) === null || _d === void 0 ? void 0 : _d.options.es2015Polyfills)) {
                    (_f = (_e = p.targets) === null || _e === void 0 ? void 0 : _e[name]) === null || _f === void 0 ? true : delete _f.options.es2015Polyfills;
                    shouldUpdate = true;
                }
            });
            if (shouldUpdate) {
                (0, devkit_1.updateProjectConfiguration)(tree, p.name, p);
            }
        });
    });
}
exports.default = default_1;
