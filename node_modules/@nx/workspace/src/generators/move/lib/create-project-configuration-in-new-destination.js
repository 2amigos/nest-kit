"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectConfigurationInNewDestination = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
function createProjectConfigurationInNewDestination(tree, schema, projectConfig) {
    projectConfig.name = schema.newProjectName;
    // Subtle bug if project name === path, where the updated name was being overrideen.
    const { name } = projectConfig, rest = tslib_1.__rest(projectConfig, ["name"]);
    // replace old root path with new one
    const projectString = JSON.stringify(rest);
    const newProjectString = projectString.replace(new RegExp(projectConfig.root, 'g'), schema.relativeToRootDestination);
    const newProject = Object.assign({ name }, JSON.parse(newProjectString));
    // Create a new project with the root replaced
    (0, devkit_1.addProjectConfiguration)(tree, schema.newProjectName, newProject);
}
exports.createProjectConfigurationInNewDestination = createProjectConfigurationInNewDestination;
