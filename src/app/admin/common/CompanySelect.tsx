// src/components/admin/common/CompanySelect.tsx  ← PINDAH KE FOLDER COMMON!
"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/src/app/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/src/app/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/app/ui/dialog";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/src/app/ui/popover";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { withResolvedAdminBasePath } from "@/src/lib/app-config";

type Company = { id: number; name: string; logoUrl?: string | null };
type CompanyCreateResponse = { company?: Company; existed?: boolean; error?: string };

type Props = {
  companies: Company[];
  value?: number | null;
  onChange: (id: number | null) => void;
  placeholder?: string;
};

// GLOBAL STATE — SEMUA CompanySelect PAKAI INI!
let globalCompanies: Company[] = [];
let listeners: ((companies: Company[]) => void)[] = [];

export default function CompanySelect({ companies: initialCompanies, value, onChange, placeholder = "Pilih perusahaan..." }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);

  // Sync dengan global state
  useEffect(() => {
    globalCompanies = initialCompanies;
    setCompanies(initialCompanies);

    const listener = (updated: Company[]) => {
      globalCompanies = updated;
      setCompanies(updated);
    };
    listeners.push(listener);

    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, [initialCompanies]);

  const selected = companies.find(c => c.id === value);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(withResolvedAdminBasePath("/api/companies"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });

      let payload: CompanyCreateResponse = {} as CompanyCreateResponse;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        payload = (await res.json()) as CompanyCreateResponse;
      } else {
        const raw = await res.text();
        payload = { error: raw ? "Respons server tidak valid" : "Respons server kosong" };
      }

      if (!res.ok) {
        throw new Error(payload.error || "Gagal membuat perusahaan");
      }

      if (!payload.company) {
        throw new Error("Respons server tidak valid");
      }

      const newCompany = payload.company;

      // UPDATE GLOBAL STATE → SEMUA SELECT LANGSUNG UPDATE!
      globalCompanies = globalCompanies.some((company) => company.id === newCompany.id)
        ? globalCompanies
        : [...globalCompanies, newCompany];
      listeners.forEach(l => l(globalCompanies));

      onChange(newCompany.id);
      if (payload.existed) {
        toast.success(`"${newCompany.name}" sudah ada dan langsung dipilih.`);
      } else {
        toast.success(`"${newCompany.name}" berhasil ditambahkan!`);
      }

      setNewName("");
      setDialogOpen(false);
    } catch (error: any) {
      toast.error(error?.message || "Gagal membuat perusahaan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between h-11 font-normal">
            <span className="truncate">
              {selected ? selected.name : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Cari perusahaan..." />
            <CommandEmpty>
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground mb-4">Tidak ditemukan</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setDialogOpen(true);
                    setOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Baru
                </Button>
              </div>
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    onChange(company.id);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === company.id ? "opacity-100" : "opacity-0")} />
                  {company.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Perusahaan Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-base font-medium">
                Nama Perusahaan
              </Label>
              <Input
                id="company-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: PT. Google Indonesia"
                className="h-11"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && !loading && newName.trim() && handleCreate()}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
                Batal
              </Button>
              <Button onClick={handleCreate} disabled={loading || !newName.trim()}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}