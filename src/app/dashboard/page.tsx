// src/app/dashboard/page.tsx
import { db } from "@/src/lib/prisma";                    // BENAR
import { getSession } from "@/src/lib/session";              // BENAR
import { redirect } from "next/navigation";

import {
  Briefcase,
  Wrench,
  Calendar,
  Award,
  Plus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import type { Portfolio } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const [portfolios, skillCount, workCount, certCount] = await Promise.all([
    db.portfolio.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.skill.count({ where: { userId: session.userId } }),
    db.workExperience.count({ where: { userId: session.userId } }),
    db.certification.count({ where: { userId: session.userId } }),
  ]);

  const featuredCount = portfolios.filter(p => p.featured).length;

  const stats = [
    { title: "Portfolios", value: portfolios.length, icon: Briefcase, desc: `${featuredCount} featured` },
    { title: "Skills", value: skillCount, icon: Wrench, desc: "Dikuasai" },
    { title: "Work Experience", value: workCount, icon: Calendar, desc: "Perusahaan" },
    { title: "Certifications", value: certCount, icon: Award, desc: "Terverifikasi" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Selamat datang kembali!</h1>
        <p className="text-muted-foreground mt-2">Ini ringkasan portfolio dan aktivitas kamu</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Portfolios */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Portfolios</CardTitle>
                <CardDescription>Project terbaru kamu</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/portfolios">Lihat semua</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {portfolios.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">Belum ada portfolio</p>
            ) : (
              <div className="space-y-4">
                {portfolios.slice(0, 5).map((portfolio) => (
                  <Link
                    key={portfolio.id}
                    href={`/dashboard/portfolios/${portfolio.id}`}
                    className="flex items-center gap-4 hover:bg-muted/50 p-3 -m-3 rounded-lg transition"
                  >
                    {portfolio.imageUrl ? (
                      <Image
                        src={portfolio.imageUrl}
                        alt={portfolio.title}
                        width={80}
                        height={60}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="bg-muted border-2 border-dashed rounded-md w-20 h-16" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{portfolio.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {portfolio.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                        <span className="text-xs text-muted-foreground">
                          {new Date(portfolio.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Akses cepat</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button asChild>
              <Link href="/dashboard/portfolios/create" className="flex items-center justify-center gap-3">
                <Plus className="h-4 w-4" />
                Tambah Portfolio Baru
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/skills" className="flex items-center justify-center gap-3">
                <Wrench className="h-4 w-4" />
                Kelola Skills
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/works" className="flex items-center justify-center gap-3">
                <Briefcase className="h-4 w-4" />
                Work Experience
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}