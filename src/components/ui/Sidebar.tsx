// src/components/ui/Sidebar.tsx
import Link from "next/link";
import React from "react";

const itemClass = "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100";

export default function Sidebar() {
  return (
    <aside className="w-72 border-r border-slate-200 bg-white">
      <div className="p-6">
        <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
          Navigation
        </div>

        <nav className="flex flex-col gap-1">
          <Link href="/dashboard" className={itemClass}>
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span className="text-sm font-medium">Overview</span>
          </Link>

          <Link href="/dashboard/portfolios" className={itemClass}>
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
            <span className="text-sm font-medium">Portfolios</span>
          </Link>

          <Link href="/dashboard/works" className={itemClass}>
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            <span className="text-sm font-medium">Work Experiences</span>
          </Link>

          <Link href="/dashboard/education" className={itemClass}>
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span className="text-sm font-medium">Educations</span>
          </Link>

          <Link href="/dashboard/skills" className={itemClass}>
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" />
            <span className="text-sm font-medium">Skills</span>
          </Link>

          <Link href="/dashboard/settings" className={itemClass}>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-400" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>
      </div>

      <div className="p-6 border-t border-slate-100">
        <div className="text-xs text-slate-500 mb-2">Quick actions</div>
        <Link
          href="/dashboard/portfolios/new"
          className="block w-full text-center rounded-md bg-indigo-600 text-white py-2 text-sm"
        >
          Create portfolio
        </Link>
      </div>
    </aside>
  );
}
