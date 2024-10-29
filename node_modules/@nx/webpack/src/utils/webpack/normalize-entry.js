"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeExtraEntryPoints = void 0;
const tslib_1 = require("tslib");
function normalizeExtraEntryPoints(extraEntryPoints, defaultBundleName) {
    return extraEntryPoints.map((entry) => {
        let normalizedEntry;
        if (typeof entry === 'string') {
            normalizedEntry = {
                input: entry,
                inject: true,
                bundleName: defaultBundleName,
            };
        }
        else {
            const { inject = true } = entry, newEntry = tslib_1.__rest(entry, ["inject"]);
            let bundleName;
            if (entry.bundleName) {
                bundleName = entry.bundleName;
            }
            else {
                bundleName = defaultBundleName;
            }
            normalizedEntry = Object.assign(Object.assign({}, newEntry), { bundleName });
        }
        return normalizedEntry;
    });
}
exports.normalizeExtraEntryPoints = normalizeExtraEntryPoints;
