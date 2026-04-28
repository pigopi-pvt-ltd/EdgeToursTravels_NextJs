import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/jwt";

async function authenticate(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  await connectToDatabase();
  const user = await User.findById(payload.userId);
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({
      name: user.name,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
      profileCompleted: user.profileCompleted,
      profilePhoto: user.profilePhoto || null,    
      kycStatus: user.role === "driver" ? user.driverDetails?.kycStatus : undefined,
      driverDetails: user.driverDetails,
      employeeDetails: user.employeeDetails,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticate(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    if (name) user.name = name;
    if (name && !user.profileCompleted) user.profileCompleted = true;

    await user.save();
    return NextResponse.json({
      success: true,
      name: user.name,
      profileCompleted: user.profileCompleted,
      profilePhoto: user.profilePhoto,   
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}