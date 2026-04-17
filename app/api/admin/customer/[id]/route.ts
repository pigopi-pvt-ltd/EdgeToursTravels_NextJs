import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Customer from "@/models/Customer";
import {
  verifyAdmin,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/admin-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH: Update an existing Customer
 */
export async function PATCH(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== "admin") return forbiddenResponse();
  await connectToDatabase();

  try {
    const body = await req.json();
    const { email, mobileNumber, pickupTime, dateOfBirth, ...otherData } = body;

    // 1. Check if customer exists
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    // 2. Conflict Validation (Check if new email/mobile is taken by someone else)
    if (email || mobileNumber) {
      const conflictQuery: any = { _id: { $ne: id }, $or: [] };
      if (email) conflictQuery.$or.push({ email: email.toLowerCase() });
      if (mobileNumber) conflictQuery.$or.push({ mobileNumber });

      const existingConflict = await Customer.findOne(conflictQuery);
      if (existingConflict) {
        return NextResponse.json(
          {
            error: "Email or Mobile Number already in use by another customer",
          },
          { status: 400 },
        );
      }
    }

    // 3. Structured Pickup Time Validation
    let formattedPickup = customer.pickupTime;
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

    // 4. Perform Update
    const updatedData = {
      ...otherData,
      email: email ? email.toLowerCase() : customer.email,
      mobileNumber: mobileNumber || customer.mobileNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : customer.dateOfBirth,
      pickupTime: formattedPickup,
    };

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true },
    );

    return NextResponse.json({
      message: "Customer updated successfully",
      data: updatedCustomer,
    });
  } catch (error: any) {
    console.error("Customer Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE: Remove a Customer
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorizedResponse();
  if (admin.role !== "admin") return forbiddenResponse();

  await connectToDatabase();

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id);

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Customer deleted successfully",
      id: id,
    });
  } catch (error: any) {
    console.error("Customer Deletion Error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 },
    );
  }
}
