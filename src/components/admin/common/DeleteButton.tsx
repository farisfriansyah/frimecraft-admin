// src/components/admin/common/DeleteButton.tsx
"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteButton({ action, label = "Hapus" }: { action: () => Promise<void>, label?: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm("Yakin ingin menghapus permanen akun ini?")) {
      startTransition(async () => {
        await action();
      });
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleClick} 
      disabled={isPending}
      type="button" // Penting: agar tidak men-trigger submit form lain
    >
      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}