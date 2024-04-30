import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { UserEntity } from '../entity/user.entity';

import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDtoRequest {
  @ApiProperty()
  @IsString()
  @MinLength(3, { message: 'fullname must be at least 3 length' })
  fullname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'password must be at least 8 length' })
  password: string;
}

export class CreateUserDtoResponse {
  @ApiProperty()
  userId: number;

  constructor(user: UserEntity) {
    this.userId = user.id;
  }
}

export class UserLoginRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserLoginResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  fullname: string;
}
