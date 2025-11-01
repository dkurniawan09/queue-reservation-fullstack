import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { reservation, timeSlot, service } from "@/db/schema/queue";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createReservationSchema = z.object({
  serviceId: z.string().uuid(),
  timeSlotId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const reservations = await db
      .select({
        id: reservation.id,
        status: reservation.status,
        notes: reservation.notes,
        createdAt: reservation.createdAt,
        updatedAt: reservation.updatedAt,
        service: {
          id: service.id,
          name: service.name,
          description: service.description,
          duration: service.duration,
        },
        timeSlot: {
          id: timeSlot.id,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        },
      })
      .from(reservation)
      .innerJoin(timeSlot, eq(reservation.timeSlotId, timeSlot.id))
      .innerJoin(service, eq(reservation.serviceId, service.id))
      .where(eq(reservation.userId, session.user.id))
      .orderBy(reservation.createdAt);

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceId, timeSlotId, notes } = createReservationSchema.parse(body);

    // Check if time slot exists and is available
    const [timeSlotInfo] = await db
      .select()
      .from(timeSlot)
      .where(eq(timeSlot.id, timeSlotId))
      .limit(1);

    if (!timeSlotInfo) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    if (!timeSlotInfo.isAvailable) {
      return NextResponse.json(
        { error: "Time slot is not available" },
        { status: 400 }
      );
    }

    // Check if user already has a reservation for this time slot
    const [existingReservation] = await db
      .select()
      .from(reservation)
      .where(
        eq(reservation.timeSlotId, timeSlotId)
      )
      .limit(1);

    if (existingReservation) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }

    // Create the reservation
    const [newReservation] = await db
      .insert(reservation)
      .values({
        userId: session.user.id,
        serviceId,
        timeSlotId,
        status: "confirmed",
        notes: notes || null,
      })
      .returning();

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error("Error creating reservation:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}