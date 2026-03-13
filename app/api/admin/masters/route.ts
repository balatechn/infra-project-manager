import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Generic masters API — handles locations, clients, categories via query param
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "locations") {
      const data = await prisma.masterLocation.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(data);
    }

    if (type === "clients") {
      const data = await prisma.masterClient.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(data);
    }

    if (type === "categories") {
      const data = await prisma.masterCategory.findMany({ orderBy: { name: "asc" } });
      return NextResponse.json(data);
    }

    // Return all masters at once
    const [locations, clients, categories] = await Promise.all([
      prisma.masterLocation.findMany({ orderBy: { name: "asc" } }),
      prisma.masterClient.findMany({ orderBy: { name: "asc" } }),
      prisma.masterCategory.findMany({ orderBy: { name: "asc" } }),
    ]);

    return NextResponse.json({ locations, clients, categories });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 });
    }

    if (type === "locations") {
      if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      const record = await prisma.masterLocation.create({
        data: { name: data.name, city: data.city || null, state: data.state || null },
      });
      return NextResponse.json(record, { status: 201 });
    }

    if (type === "clients") {
      if (!data.name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
      const record = await prisma.masterClient.create({
        data: {
          name: data.name,
          contactName: data.contactName || null,
          email: data.email || null,
          phone: data.phone || null,
        },
      });
      return NextResponse.json(record, { status: 201 });
    }

    if (type === "categories") {
      if (!data.name || !data.code) return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
      const record = await prisma.masterCategory.create({
        data: {
          name: data.name,
          code: data.code,
          icon: data.icon || null,
          color: data.color || null,
        },
      });
      return NextResponse.json(record, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { type, id, ...data } = body;

    if (!type || !id) {
      return NextResponse.json({ error: "Type and id are required" }, { status: 400 });
    }

    if (type === "locations") {
      const record = await prisma.masterLocation.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      return NextResponse.json(record);
    }

    if (type === "clients") {
      const record = await prisma.masterClient.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.contactName !== undefined && { contactName: data.contactName }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      return NextResponse.json(record);
    }

    if (type === "categories") {
      const record = await prisma.masterCategory.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.code !== undefined && { code: data.code }),
          ...(data.icon !== undefined && { icon: data.icon }),
          ...(data.color !== undefined && { color: data.color }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });
      return NextResponse.json(record);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) {
      return NextResponse.json({ error: "Type and id are required" }, { status: 400 });
    }

    if (type === "locations") {
      await prisma.masterLocation.delete({ where: { id } });
    } else if (type === "clients") {
      await prisma.masterClient.delete({ where: { id } });
    } else if (type === "categories") {
      await prisma.masterCategory.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
