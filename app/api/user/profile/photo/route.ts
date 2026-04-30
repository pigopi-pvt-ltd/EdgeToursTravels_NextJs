import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { verifyToken } from '@/lib/jwt';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('profilePhoto') as File | null;
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, WEBP, GIF allowed' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name);
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads/profile');
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, buffer);

  const photoUrl = `/uploads/profile/${filename}`;

  await connectToDatabase();
  const user = await User.findById(payload.userId);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (user.profilePhoto && !user.profilePhoto.startsWith('http')) {
    const oldPath = path.join(process.cwd(), 'public', user.profilePhoto);
    try { await unlink(oldPath); } catch (_) {}
  }

  user.profilePhoto = photoUrl;
  await user.save();

  return NextResponse.json({ profilePhoto: photoUrl });
}