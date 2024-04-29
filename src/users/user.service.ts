import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordHash } from './bcrypt';
import { CreateUserDtoRequest, UserLoginRequest } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';
import { JWTService } from './jwt.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    private passwordHash: PasswordHash,

    private jwtService: JWTService,
  ) {}

  async create(dto: CreateUserDtoRequest) {
    const user = this.userRepository.create({
      fullname: dto.fullname,
      password: dto.password,
      email: dto.email.toLowerCase(),
    });

    const userByEmail = await this.userRepository.findOneBy({
      email: user.email,
    });

    if (userByEmail != null) {
      throw new ConflictException('email already exists');
    }

    user.password = await this.passwordHash.hash(dto.password);

    await this.userRepository.insert(user);

    return user;
  }

  async login(dto: UserLoginRequest) {
    const user = await this.userRepository.findOne({
      where: {
        email: dto.email.toLowerCase(),
      },
      select: {
        email: true,
        password: true,
        fullname: true,
        id: true,
      },
    });

    if (user == null) {
      throw new NotFoundException('user not found');
    }

    const isMatched = await this.passwordHash.isMatch(
      dto.password,
      user.password.trimEnd(),
    );

    if (!isMatched) {
      throw new UnauthorizedException('email or username is wrong');
    }

    const accessToken = await this.jwtService.sign({ userId: user.id });

    return { accessToken, user };
  }
}
