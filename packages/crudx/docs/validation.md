
# Request Validation

Query params and path params validations are performed by an interceptor. It parses query and path parameters and then validates them.

Body request validation is done by NestJS `ValidationPipe`.

You can define the validation rules directly on your `model`, which is the same as defined in the `@Crud` options `model.type`. You can also distinguish them by `create` and `update` methods. 

You can use the `class-validator` library to achieve this:

```typescript
...
import { 
    IsDateString, 
    IsNotEmpty, 
    IsOptional, 
    IsString, 
    MaxLength 
} from "class-validator";

const { CREATE, UPDATE } = CrudValidationGroups;

@Entity()
export class Contract extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: "userId"})
    userId: string;

    @MaxLength(60)
    @Column({name: "contractNumber", type: "varchar", length: 60})
    contractNumber: string;

    @IsNotEmpty()
    @IsDateString()
    @Column({name: "startedAt", type: "date"})
    startedAt: Date;

    @Column({name: "note", type: "varchar", length: "11", default: ""})
    @IsOptional({ groups: [UPDATE] })
    @IsString()
    note: string;

    @ManyToOne((type) => User, (user) => user.id)
    @JoinColumn({
        referencedColumnName: "id",
        foreignKeyConstraintName: "contact_user",
    })
    user: User;
}
```

Alternatively, you can define a DTO (Data Transfer Object) for create, update, and replace operations using the `@Crud` `DTO` option. Let's take a look at how we can set this up:

```typescript
@Crud({
    model: {
        type: Contract,
    },
    dto: {
        create: ContractCreateDto,
        //update: ...,
        //replace: ...,
    }
}
@Controller("/users/:userId/contracts")
export class ContractController implements CrudController<Contract> {
    ...
}
```

```typescript
import { CrudValidationGroups } from "@2amtech/crudx";
import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Column } from "typeorm";

const { CREATE, UPDATE } = CrudValidationGroups;

export class ContractCreateDto {
    @MaxLength(60)
    @Column({name: "contractNumber", type: "varchar", length: 60})
    contractNumber: string;

    @IsNotEmpty()
    @IsDateString()
    @Column({name: "startedAt", type: "date"})
    startedAt: Date;

    @Column({name: "note", type: "varchar", length: "11", default: ""})
    @IsOptional({ groups: [UPDATE] })
    @IsString()
    note: string;
}
```
As you can see in the sample, you can either use the `class-validation` groups to specify the CRUD operation for which this validation is being built, or create a DTO for each operation.

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>
