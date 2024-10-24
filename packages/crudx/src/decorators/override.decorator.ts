import { BaseRouteName } from "../types";
import { OVERRIDE_METHOD_METADATA } from "../constants";

export const Override =
  (name?: BaseRouteName) =>
  (target: any, key: any, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      OVERRIDE_METHOD_METADATA,
      name || `${key}Base`,
      target[key]
    );
    return descriptor;
  };
