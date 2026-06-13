// src/app/admin/articles/components/ImageUpload.tsx
"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/src/app/ui/button";
import Image from "next/image";

export default function ImageUpload({
  onChange,
  previewUrl,
}: {
  onChange: (file: File) => void;
  previewUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChange(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative">
          <img src={preview} alt="Preview" className="w-full h-auto rounded-lg max-h-64 object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => {
              setPreview(null);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-muted/50 transition">
        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">Click untuk upload gambar</p>
        <p className="text-xs text-muted-foreground">PNG, JPG, WebP (max 5MB)</p>
        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </label>
    </div>
  );
}
