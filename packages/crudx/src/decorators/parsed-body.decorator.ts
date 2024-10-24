import { PARSED_BODY_METADATA } from "../constants";

export const ParsedBody =
  () =>
  (target: any, key: string, index: any): void => {
    Reflect.defineMetadata(PARSED_BODY_METADATA, { index }, target[key]);
  };
