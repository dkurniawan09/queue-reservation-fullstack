import { NextResponse } from "next/server";
import { db } from "@/db";
import { timeSlot, service } from "@/db/schema/queue";
import { eq, and, gte } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: { serviceId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const timeSlots = await db
      .select({
        id: timeSlot.id,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        capacity: timeSlot.capacity,
        isAvailable: timeSlot.isAvailable,
        serviceName: service.name,
        serviceDuration: service.duration,
      })
      .from(timeSlot)
      .innerJoin(service, eq(timeSlot.serviceId, service.id))
      .where(
        and(
          eq(timeSlot.serviceId, params.serviceId),
          eq(timeSlot.isAvailable, true),
          gte(timeSlot.startTime, startDate)
        )
      )
      .orderBy(timeSlot.startTime);

    // Calculate available spots for each time slot
    const timeSlotsWithAvailability = await Promise.all(
      timeSlots.map(async (slot) => {
        // This would normally count existing reservations
        // For now, we'll return the capacity
        return {
          ...slot,
          availableSpots: slot.capacity,
        };
      })
    );

    return NextResponse.json(timeSlotsWithAvailability);
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}