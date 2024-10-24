import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { IsEmailUserAlreadyExistConstraint } from "./user-email-already-exists.constraint";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, IsEmailUserAlreadyExistConstraint],
  exports: [UserService, IsEmailUserAlreadyExistConstraint],
})
export class UserModule {}
