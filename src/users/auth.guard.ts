import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWTService, UserAuthTokenPayload } from './jwt.service';

export interface IAuthRequest extends Request {
  user: UserAuthTokenPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JWTService) {}

  logger = new Logger(AuthGuard.name);

  async canActivate(context: ExecutionContext) {
    try {
      const req = this.getRequest(context);

      const token = this.getToken(req);

      const user = await this.jwtService.verify(token);

      req['user'] = user;

      return true;
    } catch (error) {
      return false;
    }
  }

  protected getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest<IAuthRequest>();
  }

  protected getToken(req: IAuthRequest) {
    const auth = req.headers['authorization'];

    if (!auth || Array.isArray(auth)) {
      throw new Error('Invalid authorization header');
    }

    // authorization => 'Bearer {token}'
    const token = auth.split('Bearer ')[1];

    return token;
  }
}
