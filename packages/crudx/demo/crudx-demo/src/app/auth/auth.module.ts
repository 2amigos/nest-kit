import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";

import { User } from "../user/user.entity";
import { UserModule } from "../user/user.module";
import { UserService } from "../user/user.service";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constants";
import { MeController } from "./me.controller";

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "60s" },
    }),
  ],
  controllers: [AuthController, MeController],
  providers: [AuthService, UserService],
  exports: [AuthService],
})
export class AuthModule {}
