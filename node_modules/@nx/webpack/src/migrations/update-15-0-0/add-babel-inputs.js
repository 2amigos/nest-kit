"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const add_babel_inputs_1 = require("@nx/js/src/utils/add-babel-inputs");
function default_1(tree) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        (0, add_babel_inputs_1.addBabelInputs)(tree);
        yield (0, devkit_1.formatFiles)(tree);
    });
}
exports.default = default_1;
