
# Nested Controllers

As discussed in the [Controllers section](./controllers.md), the `@Crud` decorator will generate a set of ready-to-use CRUD routes.

Using the `@Crud` decorator, we can still define a controller to handle the related (nested) resource CRUD operations.

Let's update the `user` enttiy sample we've created in the basics sample by adding a `phone` property, which should be an entity as well.

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
  ...

  @OneToMany((type) => Phone, (phone) => phone.user)
  phones: Phone[];
  ..
}
```

Next, let's create the `phone` entity:

```typescript
...

@Entity()
export class Phone extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  userId: string;

  @Column({ type: "varchar", nullable: false })
  phoneNumber: string;

  @ManyToOne((type) => User, (user) => user.id, { cascade: true })
  @JoinColumn({
    referencedColumnName: "id",
    foreignKeyConstraintName: "UserId",
  })
  user: User;
}
```

With our user entity updated and the `phone` entity created, we can assume the service and model creation are completed. Now, we're left to create a controller to filter the user and perform CRUD operations for the `phones` assigned to the filtered user.

First, let's define our controller. Let's assume the given path as our controller path: `/users/:userId/phones`.

```typescript
...

@Controller("/users/:userId/phones")
export class PhoneController implements CrudController<Phone> {
  constructor(public service: PhoneService) {}
}
```

It creates our controller, but to have the magic working, we have to define our `@Crud` decorator.

As described in the [Controllers section](./controllers.md), we need to define the `:userId` route param in our `@crud` `param` options. Additionally, since we've defined the `phone` entity id as `UUID`, we have to let the `@Crud` decorator know about it as well:

```typescript
...

@Crud({
    model: {
        type: Phone
    },
    params: {
        slug: {
            field: "id",
            type: "uuid",
            primary: true,
        },
        userId: {
            field: "userId",
            type: "uuid"
        },
    },
})
@Controller("/users/:userId/phones")
export class PhoneController implements CrudController<Phone> {
  constructor(public service: PhoneService) {}
}
```

With this setup, we'll already have these API endpoints created, with the very same specifications described in the [controllers section:](./controllers.md):

>GET /users/:userId/phones

>GET /users/:userId/phones/:id

>POST /users/:userId/phones

>POST /users/:userId/phones/bulk

>PATCH /users/:userId/phones/:id

>PUT /users/:userId/phones/:id

>DELETE /users/:userId/phones/:id

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>