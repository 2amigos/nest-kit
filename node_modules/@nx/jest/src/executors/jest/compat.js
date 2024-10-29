"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devkit_1 = require("@nx/devkit");
const jest_impl_1 = require("./jest.impl");
exports.default = (0, devkit_1.convertNxExecutor)(jest_impl_1.default);
