
# Queries

You can set query filters for the `GET` requests.

```typescript
@Crud({
  ...
  query?: {
    allow?: string[];
    exclude?: string[];
    persist?: string[];
    filter?: QueryFilterOption;
    join?: JoinOptions;
    sort?: QuerySort[];
    limit?: number;
    maxLimit?: number;
    cache?: number | false;
    alwaysPaginate?: boolean;
  },
  ...
})
```

## allow

An Array of fields that are allowed to be received in `GET` requests. If empty or undefined, allow all fields.

```typescript
{
  allow: ["name", "email"];
}
```

## exclude

An Array of fields that will be excluded from the `GET` response (and not queried from the database).

```typescript
{
  exclude: ["accessToken"];
}
```

## persist

An Array of fields that will always be persisted in the `GET` response.

```typescript
{
  persist: ["createdAt"];
}
```

## filter

This option can be used in two scenarios:

1. If you want to add some conditions to the request:

```typescript
{
  filter: {
    isActive: {
      $ne: false;
    }
  }
}
```

which is the same as:

```typescript
{
  filter: [
    {
      field: "isActive",
      operator: "$ne",
      value: false,
    },
  ];
}
```

2. If you want to transform your query search conditions or even return a completely new one (i.e., persist only one set of conditions and ignore search coming from the request):

* Totally ignore any query search conditions:

```typescript
{
  filter: () => {};
}
```

* Totally ignore any query search conditions and persist some conditions.

```typescript
{
  filter: () => ({
    isActive: {
      $ne: false;
    }
  });
}
```

* Transform query search conditions:

```typescript
import { SCondition } from '@2amtech/crudx'

...

{
  filter: (search: SCondition, getMany: boolean) => {
    return getMany ? search : {
      $and: [
        ...search.$and,
        { isActive: true },
      ],
    }
  };
}
```

> <b>Notice:</b> The first function parameter here, `search`, will always be either `{ $and: [...] }` or `{ $or: [...] }`. It depends on whether you're using the `@CrudAuth()` decorator:

* If you're not using it, or if you are and it has a `filter` function, then `search` will contain `$and` type of conditions.

* If you are using it and it has an `or` function, then `search` will contain `$or` type of conditions.

List of available operators:

| Operator | Logic |
| -- | -- |
| EQUALS | $eq |
| NOT_EQUALS | $ne |
| GREATER_THAN | $gt |
| LOWER_THAN | $lt |
| GREATER_THAN_EQUALS | $gte |
| LOWER_THAN_EQUALS | $lte |
| STARTS | $starts |
| ENDS | $ends |
| CONTAINS | $cont |
| EXCLUDES | $excl |
| IN | $in |
| NOT_IN | $notin |
| IS_NULL | $isnull |
| NOT_NULL | $notnull |
| BETWEEN | $between |
| EQUALS_LOW | $eqL |
| NOT_EQUALS_LOW | $neL |
| STARTS_LOW | $startsL |
| ENDS_LOW | $endsL |
| CONTAINS_LOW | $contL |
| EXCLUDES_LOW | $exclL |
| IN_LOW | $inL |
| NOT_IN_LOW | $notinL |

## join

You can fetch join query parameters in `GET` requests.

Each key of the join object must strongly match the name of the corresponding resource relation. If a particular relation name is not present in this option, then the user will not be able to retrieve these relational objects in a `GET` request.

All fields

```typescript
{
  join: {
    profile: {
      persist: ['name'],
      exclude: ['token'],
      eager: true,
      required: true,
    },
    tasks: {
      allow: ['content'],
    },
    notifications: {
      eager: true,
      select: false,
    },
    company: {},
    'company.projects': {
      persist: ['status']
    }, 
    'users.projects.tasks': {
      exclude: ['description'],
      alias: 'projectTasks',
    },
  }
}
```

For each relation option, you can specify the following (all below are optional):

`allow`: An `Array` of fields that are allowed to be received in `GET` requests. If `empty` or `undefined`, allow all.

`exclude`: An `Array` of fields that will be excluded from the `GET` response (and not queried from the database).

`persist`: An `Array` of fields that will always be persisted in the `GET` response.

`eager`: A `boolean` type - indicating whether or not the current relation should persist in every `GET` response.

`required`: Specifies whether a relation should be required or not. For `RDBMS`, this means use either `INNER` or `LEFT` join. Default: `false`.

`alias`: Set an alias for a relation.

`select`: A `boolean` type. If `false`, the relation will be joined but not selected and not included in the response.

## sort

An `Array` of `sort` objects that will be merged (combined) with query `sort` if those are passed in `GET` request. If not, the `sort` will be added to the database query as a stand-alone condition.

```typescript
{
  sort: [
    {
      field: "id",
      order: "DESC",
    },
  ];
}
```

## limit

Default limit that will be applied to the database query.

```typescript
{
  limit: 25,
}
```

## maxLimit

Maximum amount of results that can be queried in `GET` requests.

><b>Notice:</b> It's strongly recommended to set up this option. Otherwise, the database query will be executed without any `LIMIT` condition.

```typescript
{
  maxLimit: 100,
}
```

## cache

If Caching Results are implemented in your project, you can set up a default `cache` in milliseconds for `GET` response data. 

Cache can be reseted by using `cache=0` query parameter in your GET requests.

```typescript
{
  cache: 2000,
}
```

## alwaysPaginate

Either always return an object with paginated data or not.

```typescript
{
  alwaysPaginate: true,
}
```

You can define a set of query params globally for your application. Refer to [Global Options](./global-options.md) for more details.

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>