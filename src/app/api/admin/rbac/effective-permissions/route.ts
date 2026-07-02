import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { guardApiPermission } from "@/src/lib/security/guards";

export async function GET(request: NextRequest) {
  const guard = await guardApiPermission("role.manage");
  if (!guard.ok) return guard.response;

  const userIdParam = request.nextUrl.searchParams.get("userId");
  const userId = userIdParam ? Number(userIdParam) : null;

  if (userIdParam && (Number.isNaN(userId) || (userId ?? 0) <= 0)) {
    return NextResponse.json({ error: "userId tidak valid" }, { status: 400 });
  }

  const users = await db.user.findMany({
    where: userId ? { id: userId } : undefined,
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      role: {
        select: {
          id: true,
          name: true,
          permissions: {
            select: {
              id: true,
              name: true,
            },
            orderBy: { name: "asc" },
          },
        },
      },
    },
    orderBy: { id: "asc" },
    take: userId ? 1 : 200,
  });

  const data = users.map((user) => {
    const permissionNames = user.role.permissions.map((permission) => permission.name);
    const hasAllPermission = permissionNames.includes("all");

    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      role: {
        id: user.role.id,
        name: user.role.name,
      },
      effectivePermissions: {
        hasAllPermission,
        permissions: permissionNames,
      },
    };
  });

  return NextResponse.json({
    success: true,
    count: data.length,
    data,
  });
}
