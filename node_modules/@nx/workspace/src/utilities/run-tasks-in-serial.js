"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTasksInSerial = void 0;
const tslib_1 = require("tslib");
/**
 * Run tasks in serial
 *
 * @deprecated This function will be removed from `@nx/workspace` in version 17. Prefer importing it from `@nx/devkit`.
 * @param tasks The tasks to run in serial.
 */
function runTasksInSerial(...tasks) {
    return () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        for (const task of tasks) {
            yield task();
        }
    });
}
exports.runTasksInSerial = runTasksInSerial;
