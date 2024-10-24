
# Global Options

o reduce repetition in your `CrudOptions` in every controller, you can specify some options globally:

```typescript
{
  queryParser?: RequestQueryBuilderOptions;
  routes?: RoutesOptions;
  params?: ParamsOptions;
  auth?: {
    property?: string;
  };
  query?: {
    limit?: number;
    maxLimit?: number;
    cache?: number | false;
    alwaysPaginate?: boolean;
  };
  serialize?: {
    getMany?: false;
    get?: false;
    create?: false;
    createMany?: false;
    update?: false;
    replace?: false;
    delete?: false;
  };
}
```

* `queryParser:` These are options for RequestQueryParser that is being used in CrudRequestInterceptor to parse/validate query and path params.
* `routes:` Same as defined in the [Routes](./routes.md) section.
* `params:` Same as defined in the [controllers.params](./controllers.md#params) section.
* `query`: From the options listed on queries [queries](./query-filter.md#queries), `limit`, `maxLimit`, `cache` and `alwaysPaginate` are available to be applied globally.
* `serialize:` Allows you to globally disable serialization for particular actions..

In order to apply the global options, you need to set them up before the `AppModule` class is imported.

```typescript
import { CrudConfigService } from '@2amtech/crudx';

CrudConfigService.load({
  query: {
    limit: 25,
    cache: 2000,
  },
  params: {
    id: {
      field: 'id',
      type: 'uuid',
      primary: true,
    },
  },
  routes: {
    updateOneBase: {
      allowParamsOverride: true,
    },
    deleteOneBase: {
      returnDeleted: true,
    },
  },
});

import { AppModule } from './app.module';

...
```

Notice: All these options can be overridden in each `CrudController`.

<blockquote>
    <a href="http://www.2amigos.us"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2amigos.us">www.2am.tech</a>
</blockquote>