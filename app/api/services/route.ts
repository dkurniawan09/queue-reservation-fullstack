import { NextResponse } from "next/server";
import { db } from "@/db";
import { service } from "@/db/schema/queue";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const services = await db
      .select()
      .from(service)
      .where(eq(service.isActive, true))
      .orderBy(service.name);

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, duration } = body;

    if (!name || !duration) {
      return NextResponse.json(
        { error: "Name and duration are required" },
        { status: 400 }
      );
    }

    const [newService] = await db
      .insert(service)
      .values({
        name,
        description: description || null,
        duration: parseInt(duration),
        isActive: true,
      })
      .returning();

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { error: "Failed to create service" },
      { status: 500 }
    );
  }
}