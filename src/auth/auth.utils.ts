import * as argon2 from 'argon2';

export class AuthCrypto {
  hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }
}
