import {
  IsAlpha,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserEntity } from '../entity/user.entity';

export class CreateUserDtoRequest {
  @IsString()
  @MinLength(3, { message: 'fullname must be at least 3 length' })
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'password must be at least 8 length' })
  password: string;
}

export class CreateUserDtoResponse {
  userId: number;

  constructor(user: UserEntity) {
    this.userId = user.id;
  }
}

export class UserLoginRequest {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserLoginResponse {
  accessToken: string;
  userId: string;
  fullname: string;
}
