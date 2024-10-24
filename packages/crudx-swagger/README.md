# @2amtech/crudx-swagger

NestJS provides great support to swagger through its package [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction).

As a library built to empower the CRUD endpoints creation, the `@2amtech/crudx` fulfills this step proving the `@2amtech/crudx-swagger`, a handy one-step setup module to add relevant meta-data for the auto-generated endpoints CRUD endpoints.

With this package, you will have defined default descriptions in your swagger docs for all your CRUD routes, being able to replace/extend them, by simply overriding the desired route, and adding your own description using the `@nestjs/swagger` decorators.

## Install

```bash
$ npm i @2amtech/crudx-swagger
```

## Configure

To configure the package, you will only have to set the `CrudxSwaggerRoutesFactory` to the `routesFactory` option into your application Global Option:

```typescript
import { CrudConfigService } from "@2amtech/crudx";
import { NestFactory } from "@nestjs/core";
import { CrudxSwaggerRoutesFactory } from "@2amtech/crudx-swagger"

CrudConfigService.load({
  ...
  routesFactory: CrudxSwaggerRoutesFactory,
});

import { AppModule } from "./app/app.module";
...
```

Then, you have to create a swagger document and the app itself, as it's usually done:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  const port = process.env.PORT || 3000;

  const config = new DocumentBuilder().setTitle("Crudx Swagger").setDescription("Crudx-Swagger").setVersion("1.0").addTag("crudx-swagger").build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port);
}

bootstrap();
```

## Overring docs

If you want to change the default docs or update some route docs with your own description, all you have to do is override the route, and then apply your decorators:

```typescript
...

@Crud({
  model: {
    type: User,
  },
})
@Controller('/user')
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}

  get base(): CrudController<User> {
    return this;
  }

  @Override()
  @ApiResponse(<ApiResponseOptions>{
    status: 200,
    description: "Overriden description",
  })
  async getOne(req: CrudRequest): Promise<User> {
      return this.base.getOneBase(req);
  }
}
```

<blockquote>
    <a href="http://www.2amigos.us"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2amigos.us">www.2am.tech</a>
</blockquote>
