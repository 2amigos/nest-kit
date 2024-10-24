
# ORM

The library is designed to support any ORM and any database.

Supported ORMs:

* TypeORM

## TypeORM

To start using the built-in `TypeORM` with Crudx, we must first define a service wich extends the `TypeOrmCrudService` class, injecting the `TypeORM` entity.

Let's first create the entity:

```typescript
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}

```

With our entity created, let’s create the service:

```typescript
import { Catch, Injectable } from '@nestjs/common';
import { Category } from './category.entity';
import { TypeOrmCrudService } from '@2amtech/crudx';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ValidationError } from 'class-validator';

@Injectable()
@Catch(QueryFailedError, ValidationError, EntityNotFoundError)
export class CategoryService extends TypeOrmCrudService<Category> {
  constructor(@InjectRepository(Category) readonly repo) {
    super(repo);
  }
}

```

<blockquote>
    <a href="http://www.2am.tech"><img src="http://www.gravatar.com/avatar/55363394d72945ff7ed312556ec041e0.png"></a><br>
    <i>web development has never been so fun</i><br> 
    <a href="http://www.2am.tech">www.2am.tech</a>
</blockquote>