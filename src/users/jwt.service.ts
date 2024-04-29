import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export type UserAuthTokenPayload = {
  userId: number;
};

@Injectable()
export class JWTService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async sign(payload: UserAuthTokenPayload) {
    return this.jwtService.signAsync(payload, { expiresIn: '8h' });
  }

  async verify(token: string) {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('jwt.secret'),
    });
  }
}
