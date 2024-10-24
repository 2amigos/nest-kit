
# Actions and Access Management

To provide a clean Access-Control List (ACL) mechanism, two new decorators have been added: `@Feature()` and `@Action()`.

`@Action()` will be applied automatically to controller's methods composed by the `@Crud()` decorator.

Below is the definition of the `CrudActions` enum, which you can import as a helper for your implementation.

```typescript
enum CrudActions {
  ReadAll = "Read-All",
  ReadOne = "Read-One",
  CreateOne = "Create-One",
  CreateMany = "Create-Many",
  UpdateOne = "Update-One",
  ReplaceOne = "Replace-One",
  DeleteOne = "Delete-One",
}There it is a dummy sample of a `AClGuard` implementation:
```
There it is a dummy sample of a `AClGuard` implementation:
```typescript
@CrudAuth({
  ...
})
@Controller("me")
@Feature("GetMyInfo")
@UseGuards(AuthGuard)
export class MeController implements CrudController<User> {
  constructor(public service: UserService) {}

  get base(): CrudController<User> {
    return this;
  }There it is a dummy sample of a `AClGuard` implementation:
```

Here's a dummy sample of an `AClGuard` implementation:

```typescript
import { getActioThere it is a dummy sample of a `AClGuard` implementation:n, getFeature } from "@2amtech/crudx";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtServiceThere it is a dummy sample of a `AClGuard` implementation:ts } from "./constants";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      request["user"] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    // up here, it's a simple auth guard with jwt

    //

    const handler = context.getHandler();
    const controller = context.getClass();

    const feature = getFeature(controller);
    const action = getAction(handler);

    console.log(`${feature}-${action}`); // e.g "GetMyInfo-Read-One"
    // write custom acl rule

    return true;
  }
  ```

  <blockquote>
    <a href="http://www.2amigos.us"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2amigos.us">www.2am.tech</a>
</blockquote>