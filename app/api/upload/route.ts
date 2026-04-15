import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const folder = (formData.get('folder') as string) || 'general';
  
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  
  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create upload directory if not exists
  const uploadDir = path.join(process.cwd(), 'public/uploads', folder);
  await mkdir(uploadDir, { recursive: true });
  
  // Generate unique filename
  const ext = path.extname(file.name);
  const filename = `${uuidv4()}${ext}`;
  const filePath = path.join(uploadDir, filename);
  
  await writeFile(filePath, buffer);
  
  const url = `/uploads/${folder}/${filename}`;
  return NextResponse.json({ url });
}