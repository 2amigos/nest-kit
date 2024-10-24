import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Observable } from "rxjs";

import { getAction, getFeature } from "../../../src";

export class ACLGuard implements CanActivate {
  private ALLOWED_ACTIONS = ["readMe-Read-One"];

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handler = context.getHandler();
    const controller = context.getClass();

    const feature = getFeature(controller);
    const action = getAction(handler);

    const filteredActions = this.ALLOWED_ACTIONS.filter(
      (actionItem) => actionItem === `${feature}-${action}`
    );

    if (filteredActions.length === 0) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
