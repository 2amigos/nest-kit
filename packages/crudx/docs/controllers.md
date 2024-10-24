
# Controllers

As seen on basics, the `@Crud` decorator is our means of defining CRUD controllers. We'll cover most of this decorator option in this section.

When we define a CRUD controller using the @CRUD decorator, it generates the following API endpoints:

## Get many

>GET /user

*Result:* array of resources | pagination object with data

*Status Codes:* 200

## Get one

>GET /user/:id

*Request Params:* :`id` - some resource filed (slug)

*Result:* object | error object

*Status Codes:* 200 | 404

## Create one

>POST /user

*Request Body:* object resource object with nested (relational) object

*Result:* created resource object | error object

*Status Codes:* 201 | 400

## Create many

>POST /user/bulk

*Request Body:* array of resources objects | array of resources objects with nested (relational) resources

```json
{
    "bulk": [
        {
            "email": "sample@email.com", 
            "password": "1234!@#$"
        },
        {
            "email": "testing@email.com", 
            "password": "!@#$1234"
        }
    ]
}
```

*Result:* array of created resources | error object

*Status Codes:* 201 | 400

## Update one 

>PATCH /user/:id

*Request Params:* :id - some resource field (slug)

*Request Body:* resource object (or partial) | resource object with nested (relational) resources (or partial)

*Result:* updated partial resource object | error object

*Status Codes:* 200 | 400 | 404

## Replace one

>PUT /user/:id

*Request Params:* :id - some resource field (slug)

*Request Body:* resource object | resource object with nested (relational) resources (or partial)

*Result:* replaced resource object | error object

*Status Codes:* 200 | 400 | 404

## Delete one

>DELETE /user/:id

*Request Params:* :id - some resource field (slug)

*Result:* empty | resource object | error object

*Status Codes:* 200 | 404

## Recover one
>PATCH /user/:id

*Request params:* :id - the target deleted entity id (slug) to be recovered.

*Result:* recovered object | error object

*Status:* 200 | 404

>Note: the <b>Recover One</b> route will be available only when the enabled on @Crud option `query.softDelete` and the target TypeORM entity (defined in the @Crud model.type options, as seem below) has the [softDelete](https://doug-martin.github.io/nestjs-query/docs/persistence/typeorm/soft-delete) feature enabled.

```typescript
@Crud({
    model: {
        type: User,
    },
    query: {
        softDelete: true,
    },
})
...

// in your model
...
@DeleteDateColumn({ name: "deleted_at", nullable: true })
deletedAt: Date | null = null;
```

# @Crud Options

The `@Crud` decorator has only one required parameter:

## model

```typescript
@Crud({
    model: {
        type: Entity|Model|DTO
    },
    ...
})
```
**type**: `Entity`, `Model`, or `DTO` must be provided. This is needed for built-in validation based on NestJS ValidationPipe.

### The options listed below are not required:

## validation
```typescript
@Crud({
    ...
    validation?: ValidationPipeOptions | false;
    ...
})
```

Accepts a `ValidationPipe` options or `false` in case you want to use your own implementation.

## params

By default the @Crud decorator will use `id` with type `number` as a primary slug param.

the `param` options will acept a `slug` property,  useful for defining which field we're using to filter the results, its type, and whether it's a primary key or not.

```typescript
@Crud({
    ...
    params: {
        slug: {
            field: 'slug', // default: id
            type: 'uuid'. // default: number
            primary: true, // default: false
        },
    },
    ...
})
```

You can also define your route parameter name using params. Let's assume your controller path looks like `/users/:userId/phone`. Here's how you would define it:

```typescript
@Crud({
    ...
    params: {
        userId: {
            field: 'userId',
            type: 'uuid',
        },
    },
    ...
})
```

<blockquote>
    <a href="http://www.2amigos.us"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2amigos.us">www.2am.tech</a>
</blockquote>