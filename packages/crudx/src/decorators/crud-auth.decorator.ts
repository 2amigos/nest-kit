import { R } from "../helpers";
import { AuthOptions } from "../interfaces";

export const CrudAuth =
  (options: AuthOptions) =>
  (target: Object): void => {
    R.setCrudAuthOptions(options, target);
  };
