import { ExecutionContext, Type } from "@nestjs/common";
import { R } from "../helpers";
import { CrudActions } from "../enums";
import { MergedCrudOptions } from "../interfaces";

export class CrudBaseInterceptor {
  protected getCrudInfo(context: ExecutionContext): {
    ctrlOptions: MergedCrudOptions;
    crudOptions: Partial<MergedCrudOptions>;
    action: CrudActions;
  } {
    const ctrl: Type<any> = context.getClass();
    const handler = context.getHandler();
    const ctrlOptions: MergedCrudOptions = R.getCrudOptions(ctrl);
    const crudOptions = ctrlOptions
      ? ctrlOptions
      : {
          query: {},
          routes: {},
          params: {},
          operators: {},
        };
    const action: CrudActions = R.getAction(handler);

    return { ctrlOptions, crudOptions, action };
  }
}
