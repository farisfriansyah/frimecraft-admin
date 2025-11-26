"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Company = { id: number; name: string; logoUrl?: string | null };

type Props = {
  companies: Company[];
  value?: number;
  onChange: (id: number | null) => void;
  placeholder?: string;
};

export default function CompanySelect({ companies, value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const selected = companies.find(c => c.id === value);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/companies", {
      method: "POST",
      body: JSON.stringify({ name: newName }),
    });
    const company = await res.json();
    onChange(company.id);
    setDialogOpen(false);
    setNewName("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selected ? selected.name : placeholder || "Pilih perusahaan..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cari perusahaan..." />
          <CommandEmpty>
            <Button variant="ghost" className="w-full" onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Tambah perusahaan baru
            </Button>
          </CommandEmpty>
          <CommandGroup>
            {companies.map((company) => (
              <CommandItem
                key={company.id}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Perusahaan Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama Perusahaan</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="PT. Cakep Banget" />
            </div>
            <Button onClick={handleCreate}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Popover>
  );
}