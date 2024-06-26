import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { BaseDto } from '../../../src/common/dto/base.dto';
import {
  CreateUserDtoRequest,
  CreateUserDtoResponse,
  UserLoginRequest,
  UserLoginResponse,
} from '../dto/user.dto';
import { UserService } from '../user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  @ApiCreatedResponse({
    type: CreateUserDtoResponse,
  })
  async registerUser(@Res() res: Response, @Body() dto: CreateUserDtoRequest) {
    const user = await this.userService.create(dto);
    res
      .status(HttpStatus.CREATED)
      .json(
        new BaseDto(
          'user registered successfully',
          new CreateUserDtoResponse(user),
        ),
      );
  }

  @Post('/login')
  @ApiOkResponse({
    type: UserLoginResponse,
  })
  async login(@Res() res: Response, @Body() dto: UserLoginRequest) {
    const { accessToken, user } = await this.userService.login(dto);

    res.status(HttpStatus.OK).json(
      new BaseDto('login successfully', {
        accessToken,
        email: user.email,
        userId: user.id,
      }),
    );
  }
}
