import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/lib/prisma";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rate-limit";
import { logSecurityEvent } from "@/src/lib/security/audit";

function stripHtml(input: string | null | undefined) {
  if (!input) return null;
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeLang(value: string | null) {
  return value?.toLowerCase() === "en" ? "en" : "id";
}

export async function GET(request: NextRequest) {
  const lang = normalizeLang(request.nextUrl.searchParams.get("lang"));
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
        positionEn: true,
        location: true,
        startMonth: true,
        startYear: true,
        endMonth: true,
        endYear: true,
        isCurrent: true,
        description: true,
        descriptionEn: true,
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
        institutionEn: true,
        degree: true,
        degreeEn: true,
        startDate: true,
        endDate: true,
        description: true,
        descriptionEn: true,
      },
    }),
    db.certification.findMany({
      where: { userId: user.id },
      orderBy: [{ issueDate: "desc" }, { id: "desc" }],
      select: {
        id: true,
        title: true,
        titleEn: true,
        issuer: true,
        issuerEn: true,
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
        nameEn: true,
        level: true,
        notes: true,
        notesEn: true,
      },
    }),
  ]);

  const topSkill = (lang === "en" ? skills[0]?.nameEn || skills[0]?.name : skills[0]?.name) || (lang === "en" ? "UI/UX and Frontend" : "UI/UX dan Frontend");
  const topCompany = experiences[0]?.company?.name || (lang === "en" ? "multiple products" : "berbagai produk");

  const profile = {
    id: user.id,
    name: user.name || "Faris Friansyah",
    email: user.email,
    avatar: user.avatar,
    headline: lang === "en" ? `${topSkill} Specialist` : `Spesialis ${topSkill}`,
    about:
      lang === "en"
        ? `I build and ship digital products across ${topCompany}. Experienced in design-thinking, frontend architecture, and practical delivery from idea to production.`
        : `Saya membangun dan merilis produk digital di ${topCompany}. Berpengalaman dalam design-thinking, arsitektur frontend, dan eksekusi praktis dari ide sampai produksi.`,
    role: user.role.name,
    experiences: experiences.map((item) => ({
      id: item.id,
      position: lang === "en" ? item.positionEn || item.position : item.position,
      location: item.location,
      startMonth: item.startMonth,
      startYear: item.startYear,
      endMonth: item.endMonth,
      endYear: item.endYear,
      isCurrent: item.isCurrent,
      description: stripHtml(lang === "en" ? item.descriptionEn || item.description : item.description),
      company: item.company,
    })),
    educations: educations.map((item) => ({
      id: item.id,
      institution: lang === "en" ? item.institutionEn || item.institution : item.institution,
      degree: lang === "en" ? item.degreeEn || item.degree : item.degree,
      startDate: item.startDate,
      endDate: item.endDate,
      description: stripHtml(lang === "en" ? item.descriptionEn || item.description : item.description),
    })),
    certifications: certifications.map((item) => ({
      id: item.id,
      title: lang === "en" ? item.titleEn || item.title : item.title,
      issuer: lang === "en" ? item.issuerEn || item.issuer : item.issuer,
      issueDate: item.issueDate,
      url: item.url,
    })),
    skills: skills.map((item) => ({
      id: item.id,
      name: lang === "en" ? item.nameEn || item.name : item.name,
      level: item.level,
      notes: lang === "en" ? item.notesEn || item.notes : item.notes,
    })),
  };

  return NextResponse.json({
    success: true,
    data: profile,
  });
}
