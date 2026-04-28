import { verifyToken } from './jwt';
import User from '@/models/User';

export async function verifyAuth(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = await User.findById(payload.userId).lean();
  return user;
}