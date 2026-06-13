// src/components/admin/portfolios/ImageUpload.tsx
"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Props = {
  onChange: (file: File | undefined) => void;
  previewUrl?: string | null;
};

export default function ImageUpload({ onChange, previewUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(undefined);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Cover Image</label>
      {preview ? (
        <div className="relative inline-block">
          <Image
            src={preview}
            alt="Preview"
            width={600}
            height={400}
            className="rounded-lg object-cover max-h-64"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 transition">
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <span className="text-sm text-muted-foreground">Upload gambar (max 5MB)</span>
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      )}
    </div>
  );
}