"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devkit_1 = require("@nx/devkit");
const webpack_impl_1 = require("./webpack.impl");
exports.default = (0, devkit_1.convertNxExecutor)(webpack_impl_1.webpackExecutor);
