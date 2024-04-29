import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHash {
  async hash(password: string): Promise<string> {
    const saltOrRounds = Number(process.env.BCRYPT_SALT) || 8;

    return bcrypt.hash(password, saltOrRounds);
  }

  async isMatch(password: string, encryptedPassword: string) {
    return bcrypt.compare(password, encryptedPassword);
  }
}
