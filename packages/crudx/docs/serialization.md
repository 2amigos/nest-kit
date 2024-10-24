
# Response Serialization

Serialization is performed using [class-transformer](https://github.com/typestack/class-transformer), which is already included and turned ON in each route.

You can define it right on your `model` (the same as you've defined in your `@Crud` option `model.type`), or set it up by using DTOs.

The following example shows how to set it up on your entity:

```typescript
@Crud({
    model: {
        type: Contract,
    },
})
@Controller("/users/:userId/contracts")
export class ContractController implements CrudController<ContracSo, here's a sample:
...
import { 
    Expose, 
    Exclude 
} from "class-transformer";

@Entity()
export class Contract extends BaseEntity {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @Column({name: "userId"})
    @Exclude({toPlainOnly: true})
    userId: string;

    ...
}
```

To define data serialization using DTOs, you should define it for the specific method you want to use on the `@Crud` serialize option. You can have your entity transformation and define a `DTO` for the routes you want to have a specific behavior.

```typescript
@Crud({
    ...
    serialize: <SerializeOptions>{
        getMany?: Type<any> | false,
        get?: Type<any> | false,
        create?: Type<any> | false,
        createMany?: Type<any> | false,
        update?: Type<any> | false,
        replace?: Type<any> | false,
        delete?: Type<any> | false,
        recover?: Type<any> | false,
    }
})
```

So, here's a sample:

```typescript
@Crud({
    ...
    serialize: <SerializeOptions>{
        create: ContractCreateResponseDto,
    }
})
...
```

```typescript
import { Exclude } from "class-transformer";

export class ContractCreateResponseDto {
    readonly id: number;

    @Exclude()
    readonly userId: string;
    
    readonly contractNumber: string;
    readonly startedAt: string;
    readonly note: string;
}
```

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>