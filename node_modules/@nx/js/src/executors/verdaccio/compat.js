"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devkit_1 = require("@nx/devkit");
const verdaccio_impl_1 = require("./verdaccio.impl");
exports.default = (0, devkit_1.convertNxExecutor)(verdaccio_impl_1.verdaccioExecutor);
