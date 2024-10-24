import { ParsedRequestParams } from "./parsed-request.interface";
import { CrudRequestOptions } from "./crud-options.interface";

export interface CrudRequest {
  parsed: ParsedRequestParams;
  options: CrudRequestOptions;
  /** authenticated user's from request */
  auth?: {};
}
