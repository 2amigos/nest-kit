# Requests and Query Params

`2am/crudx` provides a full range of path and query parameter parsing/validation to help you build rich RESTful APIs.

## Query Params

By default, we support these param names:

`fields, select`: Get selected fields in GET result

`s`: Search conditions (`$and`, `$or` with all possible variations)

`or`: Filter `GET` result by `OR` type of condition

`join`: Receive joined relational resources in `GET` result (with all or selected fields)

`sort`: Sort `GET` results by some `field` in `ASC` | `DESC` order

`per_page, limit`: Limit the amount of received resources

`offset`: Offset some amount of received resources

`page`: Receive a limited portion of resources

`cache`: Reset the cache (if enabled) and receive resources directly from the database.

> **Notice:** You can easily map your own query param names and choose additional string delimiters by applying global options.

Here is the description of each of those using default param names:

### select

Selects fields that should be returned in the response body.

*Syntax:*

>?fields=field1,field2,...

### search

Add a search condition as a JSON string to your request. You can combine `$and`, `$or` and use any [conditions](./requests.md#filter-conditions) you need.

Make sure it's being sent encoded or just use 
[QueryBuilderService](./requests.md#query-builder-service).

*Syntax:*

>?s={"name": "Michael"}

*Some examples:*

* Search by field name that can be either null OR equals Superman

>?s={"name": {"$or": {"$isnull": true, "$eq": "Superman"}}}

* Search an entity where isActive is true AND createdAt not equal 2008-10-01T17:04:32

>?s={"$and": [{"isActive": true}, {"createdAt": {"$ne": "2008-10-01T17:04:32"}}]}

...which is the same as:

>?s={"isActive": true, "createdAt": {"$ne": "2008-10-01T17:04:32"}}

Search an entity where isActive is false OR updatedAt is not null

>?s={"$or": [{"isActive": false}, {"updatedAt": {"$notnull": true}}]}

>**Notice:** if search query param is present, then filter and or query params will be ignored.

### filter conditions

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

### filter

Adds fields request condition (multiple conditions) to your request.

*Systax:*

>?filter=field||$condition||value

>?join=relation&filter=relation.field||$condition||value

>**Notice:** Using nested filter shall join relation first.

*Examples:*

>?filter=name||$eq||batman

>?filter=isVillain||$eq||false&filter=city||$eq||Arkham (multiple filters are treated as a combination of AND type of conditions)

>?filter=shots||$in||12,26 (some conditions accept multiple values separated by commas)

>?filter=power||$isnull (some conditions don't accept value)

### or

Adds `OR` conditions to the request.

*Syntax:*

>?or=field||$condition||value

It uses the same [conditions](./requests.md#filter-conditions).

*Rules and examples:*

* If there is **only one** `or` present (without filter),  then it will be interpreted as a simple [filter](./requests.md#filter):

>?or=name||$eq||batman

* If there are **multiple** `or` present (without filter), then it will be interpreted as a compination of `OR` conditions, as follows:

> WHERE {or} OR {or} OR ...

>?or=name||$eq||batman&or=name||$eq||joker

* If there are **one** `or` and one `filter`, then it will be interpreted as an `OR` condition, as follows:

> WHERE {filter} OR {or}

>?filter=name||$eq||batman&or=name||$eq||joker

* If **both** `or` and `filter` are present in any amount (**one** or **miltiple** each), then both are interpreted as a combitation of `AND` conditions and compared with each other by an `OR` condition, as follows:

>WHERE ({filter} AND {filter} AND ...) OR ({or} AND {or} AND ...)

>?filter=type||$eq||hero&filter=status||$eq||alive&or=type||$eq||villain&or=status||$eq||dead

### sort

Adds sorting by field (by multiple fields) and order to query results.

*Syntax:*

>?sort=field,ASC|DESC

*Examples:*

>?sort=name,ASC

>?sort=name,ASC&sort=id,DESC

### join

Receive joined relational objects in a GET result (with all or selected fields). You can join as many relations as allowed in your [CrudOptions](./query-filter.md#join).

*Syntax:*

>?join=relation

>?join=relation||field1,field2,...

>?join=relation1||field11,field12,...&join=relation1.nested||field21,field22,...&join=...

*Examples:*

>?join=addresses

>?join=addresses||city,state,street

>?join=addresses||city,state,street??join=addresses.addressType||type

>**Notice:** The primary field/column always persists in relational objects. To use nested relations, the parent level MUST be set before the child level as shown in the example above.

### limit

Receive N amount of entities.

*Syntax:*

>?limit=number

### offset

Limit the amount of received resources.

*Syntax:*

>?offset=number

### page

Receive portion of a limited amount of resources (from the specified page).

*Syntax:*

>?page=number

### cache

Reset cache (if it was enabled) and receive resources directly from the database.

*Usage:*

>?cache=0

## Query Builder Service

`@2amtech/crux` provides the `QueryBuilderService` class to enhance and help with query string creation. It also offers an easy way to customize your query params names and delimiters.

### Customize

It has a static method `setOptions` that allows you to set different param names (defaults are shown below):

```typescript
improt { QueryBuilderService, RequestQueryBuilderOptions } from "@2amtech/crudx"

QueryBuilderService.setOptions(<RequestQueryBuilderOptions>{
  delim: "||",
  delimStr: ",",
  paramNamesMap: {
    fields: ["fields", "select"],
    search: "s",
    filter: ["filter[]", "filter"],
    or: ["or[]", "or"],
    join: ["join[]", "join"],
    sort: ["sort[]", "sort"],
    limit: ["per_page", "limit"],
    offset: ["offset"],
    page: ["page"],
    cache: ["cache"]
  },
});
```

## Usage

You can compose a query string in a chained methods manner:

```typescript
improt { QueryBuilderService, RequestQueryBuilderOptions, CondOperator } from "@2amtech/crudx"

const qb = RequestQueryBuilder.create();

qb.search({
  $or: [
    {
      foo: {
        $notnull: true
      },
      baz: 1
    },
    {
      bar: {
        $ne: "test"
      }
    }
  ]
});

// it's the same as:

qb.setFilter({ field: "foo", operator: CondOperator.NOT_NULL })
  .setFilter({ field: "baz": operator: "$eq", value: 1 })
  .setOr({
    field: "bar",
    operator: CondOperator.NOT_EQUALS,
    value: "test"
  });

qb.select(["foo", "bar"])
  .setJoin({ field: "company" })
  .setJoin({ field: "profile", select: ["name", "email"] })
  .sortBy({ field: "bar", order: "DECS" })
  .setLimit(20)
  .setPage(3)
  .resetCache()
  .query();

```

Or, you can pass all parameters to the create method:

```typescript
const queryString = RequestQueryBuilder.create({
  fields: ["name", "email"],
  search: { isActive: true },
  join: [{ field: "company" }],
  sort: [{ field: "id", order: "DESC" }],
  page: 1,
  limit: 25,
  resetCache: true
}).query();
```

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>