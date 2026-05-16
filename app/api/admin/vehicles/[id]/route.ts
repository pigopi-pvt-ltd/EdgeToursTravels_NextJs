import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Vehicle from '@/models/Vehicle';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const isAdmin = payload.role === 'admin';
    const hasVehiclesModule = payload.role === 'employee' && payload.modules?.includes('vehicles');

    if (!isAdmin && !hasVehiclesModule) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const isAdmin = payload.role === 'admin';
    const hasVehiclesModule = payload.role === 'employee' && payload.modules?.includes('vehicles');

    if (!isAdmin && !hasVehiclesModule) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Update simple fields
    if (body.cabNumber !== undefined) vehicle.cabNumber = body.cabNumber;
    if (body.tacNo !== undefined) vehicle.tacNo = body.tacNo;
    if (body.licenseNo !== undefined) vehicle.licenseNo = body.licenseNo;
    if (body.pollutionNo !== undefined) vehicle.pollutionNo = body.pollutionNo;
    if (body.gstNo !== undefined) vehicle.gstNo = body.gstNo;
    if (body.insuranceNo !== undefined) vehicle.insuranceNo = body.insuranceNo;
    if (body.modelName !== undefined) vehicle.modelName = body.modelName;
    if (body.manufacturingNo !== undefined) vehicle.manufacturingNo = body.manufacturingNo;
    if (body.expiryDate !== undefined) vehicle.expiryDate = new Date(body.expiryDate);
    if (body.yearOfMaking !== undefined) vehicle.yearOfMaking = Number(body.yearOfMaking);
    if (body.status !== undefined) vehicle.status = body.status;
    if (body.capacity !== undefined) vehicle.capacity = Number(body.capacity);
    if (body.type !== undefined) vehicle.type = body.type;
    if (body.ac !== undefined) vehicle.ac = body.ac;
    
    // Update vendor details
    if (body.vendor) {
      vehicle.vendor = {
        ...vehicle.vendor.toObject(),
        vendorName: body.vendor.vendorName || vehicle.vendor.vendorName,
        mobile: body.vendor.mobile || vehicle.vendor.mobile,
        gender: body.vendor.gender || vehicle.vendor.gender,
        address: body.vendor.address || vehicle.vendor.address,
        aadhar: body.vendor.aadhar || vehicle.vendor.aadhar,
        dob: body.vendor.dob ? new Date(body.vendor.dob) : vehicle.vendor.dob,
        pan: body.vendor.pan || vehicle.vendor.pan,
        email: body.vendor.email || vehicle.vendor.email,
      };
    }
    
    // Update document fields
    if (body.aadharFront !== undefined) vehicle.aadharFront = body.aadharFront;
    if (body.aadharBack !== undefined) vehicle.aadharBack = body.aadharBack;
    if (body.panImage !== undefined) vehicle.panImage = body.panImage;
    if (body.rcImage !== undefined) vehicle.rcImage = body.rcImage;
    if (body.insuranceImage !== undefined) vehicle.insuranceImage = body.insuranceImage;
    if (body.pollutionImage !== undefined) vehicle.pollutionImage = body.pollutionImage;
    
    // Handle kycDocuments - clean and convert to Map
    if (body.kycDocuments) {
      const cleanDocs: Record<string, string> = {};
      Object.entries(body.kycDocuments).forEach(([key, value]) => {
        if (!key.startsWith('$') && key !== '__v' && key !== '_id' && typeof value === 'string') {
          cleanDocs[key] = value;
        }
      });
      vehicle.kycDocuments = cleanDocs;
    }
    
    // Handle vehicleImages
    if (body.vehicleImages !== undefined) {
      vehicle.vehicleImages = body.vehicleImages;
    }

    await vehicle.save();
    
    return NextResponse.json({ 
      message: 'Vehicle updated successfully', 
      vehicle 
    });
  } catch (error: any) {
    console.error('Vehicle update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update vehicle' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const isAdmin = payload.role === 'admin';
    const hasVehiclesModule = payload.role === 'employee' && payload.modules?.includes('vehicles');

    if (!isAdmin && !hasVehiclesModule) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectToDatabase();
    const { id } = await params;
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Vehicle deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete vehicle' }, { status: 500 });
  }
}