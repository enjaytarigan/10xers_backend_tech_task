import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import {
  CreateUserDtoRequest,
  CreateUserDtoResponse,
  UserLoginRequest,
} from '../dto/user.dto';
import { UserService } from '../user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  async registerUser(@Res() res: Response, @Body() dto: CreateUserDtoRequest) {
    const user = await this.userService.create(dto);

    res.status(201).json(new CreateUserDtoResponse(user));
  }

  @Post('/login') async login(
    @Res() res: Response,
    @Body() dto: UserLoginRequest,
  ) {
    const { accessToken, user } = await this.userService.login(dto);

    res.status(200).json({ accessToken, email: user.email, userId: user.id });
  }
}
