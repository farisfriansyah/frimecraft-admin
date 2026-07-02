import { db } from "@/src/lib/prisma";
import type { Prisma } from "@prisma/client";

type SecurityAuditStatus = "success" | "deny" | "error";

type SecurityAuditEvent = {
  event: string;
  status: SecurityAuditStatus;
  route: string;
  method: string;
  actorId?: number | null;
  detail?: Record<string, unknown>;
};

function toPrismaJson(detail?: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (!detail) return undefined;

  // Normalize unknown values into JSON-serializable payload.
  return JSON.parse(JSON.stringify(detail)) as Prisma.InputJsonValue;
}

export function logSecurityEvent(payload: SecurityAuditEvent) {
  const entry = {
    ...payload,
    at: new Date().toISOString(),
  };

  // Best-effort persistence. Logging must never block or break request flows.
  void db.securityAuditLog
    .create({
      data: {
        event: payload.event,
        status: payload.status,
        route: payload.route,
        method: payload.method,
        actorId: payload.actorId ?? null,
        detail: toPrismaJson(payload.detail),
      },
    })
    .catch((error) => {
      console.error("[security-audit-db-failed]", JSON.stringify({ error: String(error), entry }));
    });

  if (payload.status === "error") {
    console.error("[security-audit]", JSON.stringify(entry));
    return;
  }

  console.info("[security-audit]", JSON.stringify(entry));
}
