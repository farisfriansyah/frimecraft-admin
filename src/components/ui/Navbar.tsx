// src/components/ui/Navbar.tsx
"use client";

import React from "react";
import { Search, Plus, LogOut } from "lucide-react";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-indigo-600 grid place-items-center text-white font-bold">
                FC
              </div>
              <div className="text-sm font-semibold">Frimecraft Admin</div>
            </Link>

            <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search portfolios, users..."
                className="bg-transparent outline-none text-sm text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/portfolios/new"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              New
            </Link>

            <div className="hidden sm:flex items-center gap-3">
              <button
                className="p-2 rounded-md hover:bg-slate-100"
                title="Notifications"
              >
                🔔
              </button>

              <div className="flex items-center gap-2">
                <img
                  src="/api/avatar" // you can replace with real avatar endpoint or static avatar
                  alt="avatar"
                  className="w-8 h-8 rounded-full bg-slate-200"
                />
                <div className="text-sm">
                  <div className="font-medium">Admin</div>
                  <div className="text-xs text-slate-500">Super Admin</div>
                </div>
              </div>

              <form action="/api/auth/logout" method="POST" className="ml-2">
                <button
                  type="submit"
                  className="p-2 rounded-md hover:bg-slate-100 text-sm flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
