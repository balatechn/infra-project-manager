import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@inframanager.com" },
    update: {},
    create: {
      email: "admin@inframanager.com",
      name: "Admin User",
      hashedPassword,
      role: "ADMIN",
    },
  });

  // Create manager user
  const managerPassword = await bcrypt.hash("manager123", 12);
  const manager = await prisma.user.upsert({
    where: { email: "manager@inframanager.com" },
    update: {},
    create: {
      email: "manager@inframanager.com",
      name: "Project Manager",
      hashedPassword: managerPassword,
      role: "MANAGER",
    },
  });

  // Create member user
  const memberPassword = await bcrypt.hash("member123", 12);
  const member = await prisma.user.upsert({
    where: { email: "engineer@inframanager.com" },
    update: {},
    create: {
      email: "engineer@inframanager.com",
      name: "Site Engineer",
      hashedPassword: memberPassword,
      role: "MEMBER",
    },
  });

  console.log("✅ Users created");

  // Create vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: "NetServe Solutions",
      contactName: "Rajesh Kumar",
      email: "rajesh@netserve.com",
      phone: "+91 9876543210",
      category: "Networking",
      rating: 4,
      slaScore: 92,
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: "SecureVision Inc.",
      contactName: "Priya Sharma",
      email: "priya@securevision.com",
      phone: "+91 9876543211",
      category: "CCTV & Security",
      rating: 5,
      slaScore: 97,
    },
  });

  const vendor3 = await prisma.vendor.create({
    data: {
      name: "CloudRack Systems",
      contactName: "Amit Patel",
      email: "amit@cloudrack.com",
      phone: "+91 9876543212",
      category: "Server & Data Center",
      rating: 4,
      slaScore: 88,
    },
  });

  console.log("✅ Vendors created");

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: "Bangalore Showroom IT Infrastructure",
      description: "Complete IT infrastructure setup for the new Bangalore showroom including networking, CCTV, and access control systems",
      client: "RetailMax India",
      location: "Bangalore, Karnataka",
      category: "NETWORKING",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-18"),
      budget: 450000,
      spent: 180000,
      status: "IN_PROGRESS",
      priority: "HIGH",
      progress: 72,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: "Mumbai Data Center Expansion",
      description: "Expand the existing data center with additional server racks, cooling, and redundant power supply",
      client: "TechFlow Corp",
      location: "Mumbai, Maharashtra",
      category: "DATA_CENTER",
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-08-30"),
      budget: 1200000,
      spent: 320000,
      status: "IN_PROGRESS",
      priority: "CRITICAL",
      progress: 28,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: "Delhi Office CCTV Installation",
      description: "Install 48 IP cameras with NVR system and monitoring setup across the Delhi corporate office",
      client: "FinSecure Ltd",
      location: "New Delhi",
      category: "CCTV",
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-04-15"),
      budget: 280000,
      spent: 0,
      status: "PLANNING",
      priority: "MEDIUM",
      progress: 0,
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: "Chennai Campus Wi-Fi Rollout",
      description: "Deploy enterprise Wi-Fi 6E across the 5-building campus with seamless roaming",
      client: "EduTech Academy",
      location: "Chennai, Tamil Nadu",
      category: "WIFI",
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-02-28"),
      budget: 350000,
      spent: 345000,
      status: "COMPLETED",
      priority: "HIGH",
      progress: 100,
    },
  });

  console.log("✅ Projects created");

  // Create tasks for Project 1
  const tasks1 = [
    { title: "Network cable laying", status: "DONE" as const, priority: "HIGH" as const, dueDate: new Date("2026-02-15"), startDate: new Date("2026-01-15") },
    { title: "Switch and router installation", status: "DONE" as const, priority: "HIGH" as const, dueDate: new Date("2026-02-28"), startDate: new Date("2026-02-16") },
    { title: "Firewall configuration", status: "DONE" as const, priority: "CRITICAL" as const, dueDate: new Date("2026-03-10"), startDate: new Date("2026-03-01") },
    { title: "CCTV camera installation", status: "IN_PROGRESS" as const, priority: "HIGH" as const, dueDate: new Date("2026-04-01"), startDate: new Date("2026-03-15") },
    { title: "Access control system setup", status: "IN_PROGRESS" as const, priority: "MEDIUM" as const, dueDate: new Date("2026-04-15"), startDate: new Date("2026-03-20") },
    { title: "Wi-Fi AP deployment", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: new Date("2026-04-30"), startDate: new Date("2026-04-01") },
    { title: "Final testing & handover", status: "TODO" as const, priority: "HIGH" as const, dueDate: new Date("2026-05-18"), startDate: new Date("2026-05-01") },
  ];

  for (let i = 0; i < tasks1.length; i++) {
    const t = tasks1[i];
    await prisma.task.create({
      data: {
        ...t,
        projectId: project1.id,
        createdById: manager.id,
        assigneeId: i % 2 === 0 ? member.id : manager.id,
        order: i + 1,
      },
    });
  }

  // Create tasks for Project 2
  const tasks2 = [
    { title: "Site survey & design", status: "DONE" as const, priority: "HIGH" as const, dueDate: new Date("2026-02-20"), startDate: new Date("2026-02-01") },
    { title: "Rack procurement & delivery", status: "IN_PROGRESS" as const, priority: "HIGH" as const, dueDate: new Date("2026-03-30"), startDate: new Date("2026-02-21") },
    { title: "Power & cooling upgrade", status: "IN_PROGRESS" as const, priority: "CRITICAL" as const, dueDate: new Date("2026-05-15"), startDate: new Date("2026-03-01") },
    { title: "Server installation", status: "TODO" as const, priority: "HIGH" as const, dueDate: new Date("2026-06-30"), startDate: new Date("2026-05-16") },
    { title: "Network interconnect", status: "TODO" as const, priority: "MEDIUM" as const, dueDate: new Date("2026-07-31"), startDate: new Date("2026-07-01") },
    { title: "Load testing & certification", status: "TODO" as const, priority: "HIGH" as const, dueDate: new Date("2026-08-30"), startDate: new Date("2026-08-01") },
  ];

  for (let i = 0; i < tasks2.length; i++) {
    const t = tasks2[i];
    await prisma.task.create({
      data: {
        ...t,
        projectId: project2.id,
        createdById: admin.id,
        assigneeId: member.id,
        order: i + 1,
      },
    });
  }

  console.log("✅ Tasks created");

  // Assign vendors to projects
  await prisma.projectVendor.create({
    data: {
      projectId: project1.id,
      vendorId: vendor1.id,
      scope: "Networking equipment and cabling",
      value: 150000,
      status: "active",
    },
  });

  await prisma.projectVendor.create({
    data: {
      projectId: project1.id,
      vendorId: vendor2.id,
      scope: "CCTV cameras and NVR system",
      value: 120000,
      status: "active",
    },
  });

  await prisma.projectVendor.create({
    data: {
      projectId: project2.id,
      vendorId: vendor3.id,
      scope: "Server racks and cooling units",
      value: 500000,
      status: "active",
    },
  });

  console.log("✅ Vendor assignments created");

  // Create milestones
  await prisma.milestone.createMany({
    data: [
      { title: "Networking Phase Complete", dueDate: new Date("2026-03-10"), status: "COMPLETED", projectId: project1.id },
      { title: "CCTV Installation Complete", dueDate: new Date("2026-04-01"), status: "PENDING", projectId: project1.id },
      { title: "Project Handover", dueDate: new Date("2026-05-18"), status: "PENDING", projectId: project1.id },
      { title: "Infrastructure Design Approved", dueDate: new Date("2026-02-20"), status: "COMPLETED", projectId: project2.id },
      { title: "Hardware Procurement Done", dueDate: new Date("2026-04-15"), status: "PENDING", projectId: project2.id },
      { title: "Data Center Go-Live", dueDate: new Date("2026-08-30"), status: "PENDING", projectId: project2.id },
    ],
  });

  console.log("✅ Milestones created");

  // Create activity logs
  await prisma.activityLog.createMany({
    data: [
      { action: "CREATED", entity: "Project", entityId: project1.id, userId: admin.id, projectId: project1.id },
      { action: "UPDATED", entity: "Task", entityId: "task", userId: manager.id, projectId: project1.id, details: { field: "status", value: "DONE" } },
      { action: "CREATED", entity: "Project", entityId: project2.id, userId: admin.id, projectId: project2.id },
      { action: "ASSIGNED", entity: "Vendor", entityId: vendor1.id, userId: manager.id, projectId: project1.id },
      { action: "COMPLETED", entity: "Milestone", entityId: "milestone", userId: member.id, projectId: project1.id },
    ],
  });

  console.log("✅ Activity logs created");
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test accounts:");
  console.log("  Admin:    admin@inframanager.com / admin123");
  console.log("  Manager:  manager@inframanager.com / manager123");
  console.log("  Engineer: engineer@inframanager.com / member123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
