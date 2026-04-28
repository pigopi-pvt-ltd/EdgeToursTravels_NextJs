import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import connectToDatabase from '@/lib/mongodb';
import Salary from '@/models/Salary';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== 'employee') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await connectToDatabase();

    // Get current month/year (e.g., "April 2026")
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const currentYear = now.getFullYear();

    const salary = await Salary.findOne({
      userId: payload.userId,
      month: currentMonth,
      year: currentYear,
    }).lean();

    if (!salary) {
      return NextResponse.json(
        { error: 'No salary record found for this month. Contact admin.' },
        { status: 404 }
      );
    }

    return NextResponse.json(salary);
  } catch (error: any) {
    console.error('Employee salary fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}