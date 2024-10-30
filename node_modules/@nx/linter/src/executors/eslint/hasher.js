"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
function run(task, context) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const res = yield context.hasher.hashTask(task);
        if (task.overrides['hasTypeAwareRules'] === true) {
            return res;
        }
        const deps = allDeps(task.id, context.taskGraph, context.projectGraph);
        const tags = (0, devkit_1.hashArray)(deps.map((d) => (context.projectsConfigurations.projects[d].tags || []).join('|')));
        const command = res.details['command'];
        let selfSource = '';
        for (let n of Object.keys(res.details)) {
            if (n.startsWith(`${task.target.project}:`)) {
                selfSource = res.details.nodes[n];
            }
        }
        const nodes = {};
        const hashes = [];
        for (const d of Object.keys(res.details.nodes)) {
            if (d.indexOf('$fileset') === -1) {
                nodes[d] = res.details.nodes[d];
                hashes.push(res.details.nodes[d]);
            }
        }
        return {
            value: (0, devkit_1.hashArray)([command, selfSource, ...hashes, tags]),
            details: {
                command,
                nodes: Object.assign({ [task.target.project]: selfSource, tags }, nodes),
            },
        };
    });
}
exports.default = run;
function allDeps(taskId, taskGraph, projectGraph) {
    if (!taskGraph.tasks) {
        return [];
    }
    const project = taskGraph.tasks[taskId].target.project;
    return projectGraph.dependencies[project]
        .filter((d) => !!projectGraph.nodes[d.target])
        .map((d) => d.target);
}
