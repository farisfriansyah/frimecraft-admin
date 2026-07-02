import { NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { hasPermission } from "@/src/lib/rbac";
import { getSession } from "@/src/lib/session";

type ActionGuardResult =
  | { ok: true; userId: number }
  | { ok: false; error: string };

type ApiGuardResult =
  | { ok: true; userId: number }
  | { ok: false; response: NextResponse };

export async function guardActionPermission(requiredPermission: string): Promise<ActionGuardResult> {
  const session = await getSession();
  if (!session?.userId) {
    return { ok: false, error: "Unauthorized" };
  }

  const allowed = await hasPermission(session.userId, requiredPermission);
  if (!allowed) {
    return { ok: false, error: "Akses ditolak" };
  }

  return { ok: true, userId: session.userId };
}

export async function guardApiAdmin(): Promise<ApiGuardResult> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      isActive: true,
      role: { select: { name: true } },
    },
  });

  const isAdminRole = user?.role?.name === "ADMIN" || user?.role?.name === "SUPER ADMIN";
  if (!user || !user.isActive || !isAdminRole) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.userId };
}

export async function guardApiPermission(requiredPermission: string): Promise<ApiGuardResult> {
  const session = await getSession();
  if (!session?.userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const allowed = await hasPermission(session.userId, requiredPermission);
  if (!allowed) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: session.userId };
}