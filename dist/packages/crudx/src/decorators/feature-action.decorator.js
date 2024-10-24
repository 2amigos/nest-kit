"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAction = exports.getFeature = exports.Action = exports.Feature = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("../constants");
const Feature = (name) => (0, common_1.SetMetadata)(constants_1.FEATURE_NAME_METADATA, name);
exports.Feature = Feature;
const Action = (name) => (0, common_1.SetMetadata)(constants_1.ACTION_NAME_METADATA, name);
exports.Action = Action;
const getFeature = (target) => Reflect.getMetadata(constants_1.FEATURE_NAME_METADATA, target);
exports.getFeature = getFeature;
const getAction = (target) => Reflect.getMetadata(constants_1.ACTION_NAME_METADATA, target);
exports.getAction = getAction;
//# sourceMappingURL=feature-action.decorator.js.map