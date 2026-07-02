import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

function stripHtml(input: string | null | undefined) {
  if (!input) return null;
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = await checkRateLimit(`public:profile-summary:${ip}`, {
    windowMs: 60_000,
    max: 120,
  });

  if (!rate.allowed) {
    logSecurityEvent({
      event: "public.profile_summary.get",
      status: "deny",
      route: "/api/public/profile-summary",
      method: "GET",
      detail: { ip, reason: "rate_limit", retryAfterMs: rate.retryAfterMs },
    });

    return NextResponse.json(
      { error: "Terlalu banyak request" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
        },
      },
    );
  }

  const targetEmail = process.env.PUBLIC_PROFILE_EMAIL || "admin@frimecraft.com";

  const user =
    (await db.user.findFirst({
      where: {
        email: targetEmail,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    })) ||
    (await db.user.findFirst({
      where: { isActive: true },
      orderBy: { id: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    }));

  if (!user) {
    return NextResponse.json({ error: "Profile tidak ditemukan" }, { status: 404 });
  }

  const [experiences, educations, certifications, skills] = await Promise.all([
    db.workExperience.findMany({
      where: { userId: user.id },
      orderBy: [{ startYear: "desc" }, { startMonth: "desc" }],
      select: {
        id: true,
        position: true,
        location: true,
        startMonth: true,
        startYear: true,
        endMonth: true,
        endYear: true,
        isCurrent: true,
        description: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.education.findMany({
      where: { userId: user.id },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      select: {
        id: true,
        institution: true,
        degree: true,
        startDate: true,
        endDate: true,
        description: true,
      },
    }),
    db.certification.findMany({
      where: { userId: user.id },
      orderBy: [{ issueDate: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        issuer: true,
        issueDate: true,
        url: true,
      },
    }),
    db.skill.findMany({
      where: { userId: user.id },
      orderBy: [{ level: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        level: true,
        notes: true,
      },
    }),
  ]);

  const topSkill = skills[0]?.name || "UI/UX and Frontend";
  const topCompany = experiences[0]?.company?.name || "multiple products";

  const profile = {
    id: user.id,
    name: user.name || "Faris Friansyah",
    email: user.email,
    avatar: user.avatar,
    headline: `${topSkill} Specialist`,
    about:
      `I build and ship digital products across ${topCompany}. ` +
      `Experienced in design-thinking, frontend architecture, and practical delivery from idea to production.`,
    role: user.role.name,
    experiences: experiences.map((item) => ({
      ...item,
      description: stripHtml(item.description),
    })),
    educations: educations.map((item) => ({
      ...item,
      description: stripHtml(item.description),
    })),
    certifications,
    skills,
  };

  return NextResponse.json({
    success: true,
    data: profile,
  });
}
