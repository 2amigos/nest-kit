"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devkit_1 = require("@nx/devkit");
const swc_impl_1 = require("./swc.impl");
exports.default = (0, devkit_1.convertNxExecutor)(swc_impl_1.swcExecutor);
