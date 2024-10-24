
# Routes

## Route Override

You can override the generated routes to add your own implementation. Below is the list of all routes composed by the `@Crud()` decorator:

```typescript
{
  getManyBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<GetManyDefaultResponse<T> | T[]>;

  getOneBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<T>;

  createOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: T,
  ): Promise<T>;

  createManyBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: CreateManyDto<T>,
  ): Promise<T>;

  updateOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: T,
  ): Promise<T>;

  replaceOneBase(
    @ParsedRequest() req: CrudRequest,
    @ParsedBody() dto: T,
  ): Promise<T>;

  deleteOneBase(
    @ParsedRequest() req: CrudRequest,
  ): Promise<void | T>;
}
```

Since all composed methods have "Base" ending in their names, overriding those endpoints can be done in two ways:

1. Attach the `@Override()` decorator without any argument to the newly created method whose name doesn't contain Base ending. So, if you want to override `getManyBase`, you need to create a `getMany` method.

2. Attach the `@Override('getManyBase')` decorator with the base method name passed as an argument if you want to override the base method with a function that has a custom name.

Example:

```typescript
import { 
    Crud, 
    CrudController, 
    CrudRequest, 
    Override, 
    ParsedBody, 
    ParsedRequest 
} from "@2amtech/crudx";
import { Controller } from "@nestjs/common";

@Controller("/users/:userId/phones")
export class PhoneController implements CrudController<Phone> {
  constructor(public service: PhoneService) {}

  get base(): CrudController<Phone> {
    return this;
  }

  @Override()
  async createOne(
      @ParsedRequest() req: CrudRequest, 
      @ParsedBody() dto
    ): Promise<Phone> {
      const response = await Promise.resolve(this.base.createOneBase(req, dto));
      
      response["customProp"] = "custom added property";

      return response;
  }

  @Override("getOneBase")
  async getPhone(
    @ParsedRequest() req: CrudRequest
  ): Promise<Phone> {
    const response = await Promise.resolve(this.base.getOneBase(req));

    response["customProp"] = "custom added property";

    return response;
  }
}
```

><b>Notice:</b> new custom route decorators have been created to simplify the process: `@ParsedRequest()` and `@ParsedBody()`. However, you can still add your param decorators to any of the methods, such as `@param()`, `@session()`, etc., or any of your own custom route decorators.

## Adding Route 

To add new routes to your controller, you must attach the `CrudRequestInterceptor` interceptor to your method. `@ParsedRequest()` and `@ParsedBody()` decorators have been created to simplify this process. However, you can still add a param decorator to your methods, such as `@param()`, `@Session()`.

Example:

```typescript
...

@Crud({
  ...
})
@Controller("users")
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}

  get base(): CrudController<User> {
    return this;
  }
  @UseInterceptors(CrudRequestInterceptor)
    @Get("/emails")
    async emails(@ParsedRequest() req: CrudRequest) {
    return this.service.find({select: ["email"]});
  }
}
```

## Route options

You can define which routes (from the generated ones) should be exposed or excluded. To achieve that, you may use the `only` and `exclude` options.

Additionally, you can set options for each generated route:

* `interceptors`: an array of your custom interceptors
* `decorators`: an array of your custom decorators
* `allowParamsOverride`: whether or not to allow body data to be overwritten by the URL params on PATH request. Default: `false`
* `returnDeleted`: whether or not an entity object should be returned in the response body on DELETE request. Default: `false`
* `returnShallow`: whether or not to return a shallow entity

```typescript
@Crud({
  ...
  routes?: {
    exclude: BaseRouteName[],
    only: BaseRouteName[],
    getManyBase: {
      interceptors: [],
      decorators: [],
    },
    getOneBase: {
      interceptors: [],
      decorators: [],
    },
    createOneBase: {
      interceptors: [],
      decorators: [],
      returnShallow: boolean;
    },
    createManyBase: {
      interceptors: [],
      decorators: [],
    },
    updateOneBase: {
      interceptors: [],
      decorators: [],
      allowParamsOverride: boolean,
      returnShallow: boolean;
    },
    replaceOneBase: {
      interceptors: [],
      decorators: [],
      allowParamsOverride: boolean,
      returnShallow: boolean;
    },
    deleteOneBase: {
      interceptors: [],
      decorators: [],
      returnDeleted: boolean,
    },
  },
  ...
})
```
<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>