import jwt from 'jsonwebtoken';
import { env } from './env';

export function signUserToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '30d' });
}

export function verifyUserToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as { userId: string };
}
