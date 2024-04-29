import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordHash } from './bcrypt';
import { UserController } from './controller/user.controller';
import { UserEntity } from './entity/user.entity';
import { JWTService } from './jwt.service';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('jwt.secret'),
          global: true,
        };
      },
    }),
  ],
  providers: [UserService, PasswordHash, JWTService],
  controllers: [UserController],
  exports: [PasswordHash, JWTService],
})
export class UserModule {}
