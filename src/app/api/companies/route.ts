// src/app/api/companies/route.ts
import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.userId) return new Response("Unauthorized", { status: 401 });

  const { name } = await req.json();
  const company = await db.company.create({
    data: { name: name.trim() },
  });

  return NextResponse.json(company);
}

export async function GET() {
  const companies = await db.company.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(companies);
}