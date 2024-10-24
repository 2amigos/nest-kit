import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { QueryFilter, QueryFilterFunction, SCondition } from "../types";
import { RequestQueryException } from "../exceptions";
import { QueryParserService } from "../services";
import { isArrayFull } from "../helpers";
import { isFunction, isNil } from "lodash";
import { ClassTransformOptions } from "class-transformer";

import { PARSED_CRUD_REQUEST_KEY } from "../constants";
import { CrudActions } from "../enums";
import { CrudRequest, MergedCrudOptions, ParamsOptions } from "../interfaces";
import { CrudBaseInterceptor } from "./crud-base.interceptor";
import { Observable } from "rxjs";

@Injectable()
export class CrudRequestInterceptor
  extends CrudBaseInterceptor
  implements NestInterceptor
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    try {
      /* istanbul ignore else */
      if (!req[PARSED_CRUD_REQUEST_KEY]) {
        const { ctrlOptions, crudOptions, action } = this.getCrudInfo(context);
        const parser = QueryParserService.create();

        parser.parseQuery(req.query, crudOptions.operators?.custom);

        let auth = null;
        if (!isNil(ctrlOptions)) {
          const search = this.getSearch(
            parser,
            crudOptions,
            action,
            req.params
          );
          auth = this.getAuth(parser, crudOptions, req);
          parser.search = auth.or
            ? { $or: [auth.or, { $and: search }] }
            : { $and: [auth.filter, ...search] };
        } else {
          parser.search = { $and: this.getSearch(parser, crudOptions, action) };
        }

        req[PARSED_CRUD_REQUEST_KEY] = this.getCrudRequest(
          parser,
          crudOptions,
          auth?.auth
        );
      }

      return next.handle();
    } catch (error) {
      throw error instanceof RequestQueryException
        ? new BadRequestException(error.message)
        : error;
    }
  }

  getCrudRequest(
    parser: QueryParserService,
    crudOptions: Partial<MergedCrudOptions>,
    auth?: any
  ): CrudRequest {
    const parsed = parser.getParsed();
    const { query, routes, params, operators } = crudOptions;
    return {
      parsed,
      options: {
        query,
        routes,
        params,
        operators,
      },
      auth,
    };
  }

  getSearch(
    parser: QueryParserService,
    crudOptions: Partial<MergedCrudOptions>,
    action: CrudActions,
    params?: any
  ): SCondition[] {
    // params condition
    const paramsSearch = this.getParamsSearch(parser, crudOptions, params);

    // if `CrudOptions.query.filter` is a function then return transformed query search conditions
    if (isFunction(crudOptions.query?.filter)) {
      const filterCond: SCondition =
        (crudOptions.query?.filter as QueryFilterFunction)(
          parser.search,
          action === CrudActions.ReadAll
        ) || {};

      return [...paramsSearch, filterCond];
    }

    // if `CrudOptions.query.filter` is array or search condition type
    const optionsFilter = isArrayFull(crudOptions.query?.filter)
      ? (crudOptions.query?.filter as QueryFilter[]).map(
          parser.convertFilterToSearch
        )
      : [(crudOptions.query?.filter as SCondition) || {}];

    let search: SCondition[] = [];

    if (parser.search) {
      search = [parser.search];
    } else if (parser.filter.length > 0 && parser.or.length > 0) {
      search =
        parser.filter.length === 1 && parser.or.length === 1
          ? [
              {
                $or: [
                  parser.convertFilterToSearch(parser.filter[0]),
                  parser.convertFilterToSearch(parser.or[0]),
                ],
              },
            ]
          : [
              {
                $or: [
                  { $and: parser.filter.map(parser.convertFilterToSearch) },
                  { $and: parser.or.map(parser.convertFilterToSearch) },
                ],
              },
            ];
    } else if (parser.filter.length > 0) {
      search = parser.filter.map(parser.convertFilterToSearch);
    } else {
      if (parser.or.length > 0) {
        search =
          parser.or.length === 1
            ? [parser.convertFilterToSearch(parser.or[0])]
            : [
                {
                  $or: parser.or.map(parser.convertFilterToSearch),
                },
              ];
      }
    }

    return [...paramsSearch, ...optionsFilter, ...search];
  }

  getParamsSearch(
    parser: QueryParserService,
    crudOptions: Partial<MergedCrudOptions>,
    params?: any
  ): SCondition[] {
    if (params) {
      parser.parseParams(params, <ParamsOptions>crudOptions.params);

      return isArrayFull(parser.paramsFilter)
        ? // @ts-ignore
          parser.paramsFilter.map(parser.convertFilterToSearch)
        : [];
    }

    return [];
  }

  getAuth(
    parser: QueryParserService,
    crudOptions: Partial<MergedCrudOptions>,
    req: any
  ): { filter?: any; or?: any; auth?: any } {
    const auth: any = {};

    /* istanbul ignore else */
    if (crudOptions.auth) {
      const userOrRequest = crudOptions.auth.property
        ? req[crudOptions.auth.property]
        : req;

      if (crudOptions.auth.property && req[crudOptions.auth.property]) {
        if (typeof req[crudOptions.auth.property] === "object") {
          if (Object.keys(req[crudOptions.auth.property]).length > 0) {
            auth.auth = req[crudOptions.auth.property];
          }
        } else {
          auth.auth = req[crudOptions.auth.property];
        }
      }

      if (isFunction(crudOptions.auth.or)) {
        auth.or = crudOptions.auth.or(userOrRequest);
      }

      if (isFunction(crudOptions.auth.filter) && !auth.or) {
        auth.filter = crudOptions.auth.filter(userOrRequest) || {};
      }

      if (isFunction(crudOptions.auth.persist)) {
        parser.setAuthPersist(crudOptions.auth.persist(userOrRequest));
      }

      const options: ClassTransformOptions = {};
      if (isFunction(crudOptions.auth.classTransformOptions)) {
        Object.assign(
          options,
          crudOptions.auth.classTransformOptions(userOrRequest)
        );
      }

      if (isFunction(crudOptions.auth.groups)) {
        options.groups = crudOptions.auth.groups(userOrRequest);
      }
      parser.setClassTransformOptions(options);
    }

    return auth;
  }
}
