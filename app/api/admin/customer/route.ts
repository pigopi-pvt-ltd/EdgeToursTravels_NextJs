import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import {
  verifyAdmin,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/admin-auth";

/**
 * GET: Fetch all customers
 * Restricted to Admins
 */
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== "admin") return forbiddenResponse();

  await connectToDatabase();

  try {
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: customers });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

/**
 * POST: Create a new Customer
 * Restricted to Admins
 */
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== "admin") return forbiddenResponse();

  await connectToDatabase();

  try {
    const body = await req.json();
    const {
      fullName,
      mobileNumber,
      email,
      gender,
      presentAddress,
      permanentAddress,
      pickupTime,
      isRegular,
      dateOfBirth,
    } = body;

    // 1. Basic Validation
    if (!fullName || !mobileNumber || !email || !presentAddress) {
      return NextResponse.json(
        { error: "Missing required profile fields" },
        { status: 400 },
      );
    }

    // 2. Check for existing Customer
    const existingCustomer = await Customer.findOne({
      $or: [{ email: email.toLowerCase() }, { mobileNumber }],
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer with this email or mobile already exists" },
        { status: 400 },
      );
    }

    // 3. Structured Pickup Time Validation
    let formattedPickup: any = undefined;
    if (pickupTime) {
      const { hour, minute } = pickupTime;
      if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
        return NextResponse.json(
          { error: "Invalid pickup time range" },
          { status: 400 },
        );
      }
      formattedPickup = { hour: Number(hour), minute: Number(minute) };
    }

    // 4. Create Customer
    const customerData = {
      fullName,
      mobileNumber,
      email: email.toLowerCase(),
      gender,
      presentAddress,
      permanentAddress,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      pickupTime: formattedPickup,
      isRegular: Boolean(isRegular),
      isVerified: false, // Defaulting to false for admin-created profiles
    };

    const customer = await Customer.create(customerData);

    return NextResponse.json(
      {
        message: "Customer created successfully",
        data: customer,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Customer Creation Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
