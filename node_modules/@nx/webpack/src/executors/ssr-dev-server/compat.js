"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const devkit_1 = require("@nx/devkit");
const ssr_dev_server_impl_1 = require("./ssr-dev-server.impl");
exports.default = (0, devkit_1.convertNxExecutor)(ssr_dev_server_impl_1.default);
