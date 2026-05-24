// src/components/admin/common/DeleteButton.tsx
"use client";

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form action={async () => {
      if (confirm("Yakin ingin menghapus permanen akun ini?")) {
        await action();
      }
    }}>
      <button 
        type="submit" 
        className="inline-flex items-center justify-center h-10 px-4 text-xs font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 shadow"
      >
        Hapus User
      </button>
    </form>
  );
}