import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdmin, unauthorizedResponse } from '@/lib/admin-auth';

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin || admin.role !== 'admin') return unauthorizedResponse();

  await connectToDatabase();
  const { employeeId, modules } = await req.json();

  if (!employeeId) {
    return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
  }

  const employee = await User.findById(employeeId);
  if (!employee || employee.role !== 'employee') {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }

  //  employeeDetails if it doesn't  exist
  if (!employee.employeeDetails) {
    employee.employeeDetails = {
      fullName: employee.name || '',
      mobile: employee.mobileNumber || '',
      gender: 'male',
      presentAddress: '',
      permanentAddress: '',
      aadhar: '',
      dob: new Date(),
      pan: '',
      email: employee.email || '',
      yearsOfExperience: 0,
      highestQualification: '',
      modules: modules || [],
    };
  } else {
    employee.employeeDetails.modules = modules || [];
  }

  await employee.save();

  return NextResponse.json({
    message: 'Modules updated',
    modules: employee.employeeDetails.modules,
  });
}