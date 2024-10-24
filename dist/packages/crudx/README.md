
# @2amtech/Crudx
The @2amtech/Crudx is a refactor inspired by the impressive work of [nestjsx/crud](https://github.com/nestjsx/crud), consolidating its three packages into one cohesive solution. It simplifies the creation of CRUD (Create, Read, Update, Delete) endpoints for RESTful applications with remarkable ease within Nest.js.

This tool provides decorators specifically designed for endpoint generation, global configurations, request validation, and specialized services, all tailored to enhance the efficiency and usability of Crudx across various contexts.

A comprehensive documentation offers a structured exploration of Crudx functionalities, meticulously divided into distinct sections. Each section is accompanied by illustrative samples and insightful comments, fostering a deeper understanding of how to effectively leverage Crudx in your projects.

## Basics

Before diving into Crudx features, it's essential to define a basic Nest.js module for CRUD operations. Let's use the User module as a sample:

First, let's define an entity.

Crudx supports TypeORM for building entities, so let's implement it:

```typescript 
import { 
  AfterLoad,
  BaseEntity,
  Entity, 
  PrimaryGeneratedColumn, 
  Column,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import * as bcrypt from "bcryptjs";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid") 
  id: string;

  @Column({ unique: true, length: 125 })
  email: string;

  @Column({ type: "varchar", length: 80 })
  password: string; 

  private tempPassword?: string;

  @AfterLoad()
  private loadTempPassword(): void {
    this.tempPassword = this.password;
  }

  @BeforeInsert()
  private async hashPassword(): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeUpdate()
  private async encryptPassword(): Promise<void> {
    if (this.tempPassword !== null && this.tempPassword !== this.password) {
      try {
        await this.hashPassword();

        this.tempPassword = this.password;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Unable to encrypt password: " + error.message);
        }
      }
    }
  }
}
```

Next, let's create a service:

```typescript
import {Injectable} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TypeOrmCrudService } from "@2amtech/crudx";
import { Catch, Injectable } from "@nestjs/common";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

@Injectable()
@Catch(QueryFailedError, EntityNotFoundError)
export class UserService extends TypeOrmCrudService<User> {
  constructor(@InjectRepository(User) readonly repo) {
    super(repo);
  }
}
```

With the service in place, let's define our controller:

Note that we're utilizing the `@Crud` decorator. When it’s defined for a controller, it automatically creates the basic CRUD routes:

* get `/user`
* get `/user/:id`
* post `/user`
* post `/user/bulk`
* patch `/user/:id`
* put `/user/:id`
* delete `/user/:id`

For further details, you can refer to the [Controllers](./docs/controllers.md) section.

In our sample, we're specifying some options for our @CRUD decorator: `model` and `params`.

The `model` option is the only required one for the `@Crud()` decorator. Its type property defines a class as the request body type, enabling data validation. Though not covered in our basics, you can find all related information in the [request validation](./docs/validation.md) section. The provided `type` should be an `Entity`, `Model` or `DTO`.

By default, the generated routes will have a parameter named `:id`. This parameter is intended to represent the model's primary key. We're using the `params` options to instruct Crudx to define our param `:id` as a  `uuid` type, indicating that it should match the `id` field of the User entity.

```typescript
import { Crud, CrudController } from "@2amtech/crudx";
import { Controller } from "@nestjs/common";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Crud({
  model: {
    type: User,
  },
  params: {
    id: {
        field: "id",
        type: "uuid",
        primary: true,
    }
  }
})
@Controller("users")
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}
}
```

With the `entity`, `service`, and `controller` defined, all that's left is to export a module and import it into the application's main module:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
```

## IntelliSense

Due to the CRUD controllers being composed by the logic of the `@Crud` decorator, IntelliSense will not be available on composed methods. To enable your code to properly access the controller's methods from the `this` keyword, you can add these lines to your class:

```typescript
import { Crud, CrudController } from '@2amtech/crudx';
import { User } from './user.entity.ts';

@Crud(User)
@Controller('user')
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}

  get base(): CrudController<User> {
    return this;
  }
}
```

While the examples provided above offer a simplistic demonstration, they effectively highlight the fundamental principles of utilizing Crudx. For more in-depth insights and comprehensive guidance, we encourage you to explore the dedicated sections outlined below, which deal with specific functionalities and advanced usage scenarios.

## Further Reading

* [Controllers](./docs/controllers.md)
* [Nested Controllers](./docs/nested-controllers.md)
* [Routes](./docs/routes.md)
* [Queries and Fiters](./docs/query-filter.md)
* [Request Validation](./docs/validation.md)
* [Response Serialization](./docs/serialization.md)
* [Actions and Access Management](./docs/actions-access-management.md)
* [Request Authenticaten](./docs/authentication.md)
* [Global Options](./docs/global-options.md)
* [ORM](./docs/orm.md)
* [Requests and Query Params](./docs/requests.md)
* [Swagger - @2amtech/crudx-swagger](https://github.com/2amigs/nest-kit/packages/crudx-swagger/README.md)

Thank you for exploring our resources. Happy coding!

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>