"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeRequire = void 0;
function safeRequire(path, loader) {
    try {
        return loader ? loader() : require(path);
    }
    catch (_) {
        return null;
    }
}
exports.safeRequire = safeRequire;
//# sourceMappingURL=safe-require.helper.js.map