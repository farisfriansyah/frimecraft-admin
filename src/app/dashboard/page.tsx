// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/session";
import Navbar from "@/src/components/ui/Navbar";
import Sidebar from "@/src/components/ui/Sidebar";
import StatsCard from "@/src/components/ui/Statscard";
import PortfolioCard from "@/src/components/ui/PortfolioCard";
import React from "react";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  // Example data (in future, fetch from API)
  const stats = [
    { title: "Portfolios", value: 12, subtitle: "Total published" },
    { title: "Views (30d)", value: "4.2k", subtitle: "Last 30 days" },
    { title: "Skills", value: 18, subtitle: "Tracked skills" },
    { title: "Certifications", value: 3, subtitle: "Verified" },
  ];

  const portfolios = [
    {
      id: 1,
      title: "Product Dashboard UI",
      image: "/mnt/data/1440w default.jpg",
      description: "Redesign dashboard untuk SaaS manajemen tugas.",
      tags: "dashboard,saas,ui",
    },
    {
      id: 2,
      title: "E-commerce Landing Page",
      image: "/mnt/data/1440w default.jpg",
      description: "Landing page konversi tinggi untuk brand FMCG.",
      tags: "landing,ecommerce,ui",
    },
    {
      id: 3,
      title: "Mobile App (Prototype)",
      image: "/mnt/data/1440w default.jpg",
      description: "Prototype mobile banking & payments.",
      tags: "mobile,prototype,ui",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex gap-6">
          <Sidebar />

          <main className="flex-1">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Selamat datang, Admin!</h1>
              <p className="text-slate-600 mt-2">
                Kelola portfolio, skills, pendidikan, dan experience di sini.
              </p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {stats.map((s) => (
                <StatsCard key={s.title} title={s.title} value={s.value} subtitle={s.subtitle} />
              ))}
            </section>

            <section className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Portfolios</h2>
                <a
                  href="/dashboard/portfolios"
                  className="text-sm text-indigo-600 hover:underline"
                >
                  View all
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {portfolios.map((p) => (
                  <PortfolioCard
                    key={p.id}
                    title={p.title}
                    image={p.image}
                    description={p.description}
                    tags={p.tags}
                  />
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="/dashboard/portfolios/new"
                  className="block rounded-md bg-white border p-4 hover:shadow"
                >
                  Create Portfolio
                </a>
                <a href="/dashboard/skills" className="block rounded-md bg-white border p-4 hover:shadow">
                  Manage Skills
                </a>
                <a href="/dashboard/works" className="block rounded-md bg-white border p-4 hover:shadow">
                  Manage Experiences
                </a>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
