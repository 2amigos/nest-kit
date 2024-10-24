
# Request Authentication

The library provides the `@CrudAuth()` decorator to allow you to filter the results for authenticated requests.

The `@CrudAuth()` decoretor accepts the following options:

```typescript
{
  property?: string;
  filter?: (req: any) => SCondition | void;
  or?: (req: any) => SCondition | void;
  persist?: (req: any) => ObjectLiteral;
}
```

`property:` Property on the Request object where the user's data is stored after successful authentication.

`filter:` A function that should return `search` condition and will be added to the query search params and path params as an `$and` condition:

>`{Auth condition}` AND `{Path params}` AND `{Search|Filter}`

or: A function that should return search conditions and will be added to the query search params and path params as a $or condition. If it's used, then the filter function will be ignored.

>`{Auth condition}` OR `({Path params} AND {Search|Filter})`

Let's see this decorator in practice by creating a route to return the authenticated user's info:

```typescript
...
import { Crud, CrudAuth, CrudController } from "@2amtech/crudx";

@Crud({
    routes: {
    only: ["getOneBase"],
  },
})
@CrudAuth({
  property: "user",
  filter: (user: User) => ({
    id: user.id,
  }),
})
@Controller("me")
@UseGuards(AuthGuard)
export class MeController implements CrudController<User> {
  constructor(public service: UserService) {}
}
```

To make our sample more complete, we've defined this controller to have only the route (as described in [routes](./routes.md)) `getOneBase` to read the authenticated user's info.

Then, our filter condition will only bring the results where the entity field `:id` matches with the value found on the authenticated variable `user.id`.

>Though we're not obligated to set guards for our controller or the routes when using the  `@CrudAuth()` decorator, it is strongly recommended as it prevents errors. It returns an unauthorized error when there is no active session instead of an undefined property.

<blockquote>
    <a href="http://www.2amigos.us"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2amigos.us">www.2am.tech</a>
</blockquote>