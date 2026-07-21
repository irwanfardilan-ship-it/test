import jwt from 'jsonwebtoken';

export class JwtTokenProvider {
  constructor(private secret: string, private expiresIn: string) {}

  generateToken(payload: any): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }
}
