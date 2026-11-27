// src/components/admin/portfolios/ImageUpload.tsx
"use client";

import { ImageOff, Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { withResolvedAdminBasePath } from "@/src/lib/app-config";
import {
  getPortfolioImageSrc,
  MAX_PORTFOLIO_IMAGE_SIZE,
  PORTFOLIO_IMAGE_MIME_TYPES,
} from "@/src/lib/portfolio-image";

type Props = {
  onChange: (file: File | undefined, removeCurrentImage: boolean) => void;
  previewUrl?: string | null;
};

export default function ImageUpload({ onChange, previewUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [imageFailed, setImageFailed] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";

    if (file) {
      if (!PORTFOLIO_IMAGE_MIME_TYPES.has(file.type)) {
        toast.error("Gunakan gambar JPG, PNG, WebP, atau AVIF.");
        return;
      }
      if (file.size > MAX_PORTFOLIO_IMAGE_SIZE) {
        toast.error("Ukuran gambar maksimal 5 MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFailed(false);
        setPreview(reader.result as string);
      };
      reader.onerror = () => toast.error("Gambar gagal dibaca.");
      reader.readAsDataURL(file);
      onChange(file, false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setImageFailed(false);
    onChange(undefined, true);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Cover Image</label>
      {preview ? (
        <div className="relative h-64 w-full min-w-0 overflow-hidden rounded-lg bg-muted">
          {imageFailed ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageOff className="h-8 w-8" />
              <span className="text-sm">Gambar tidak dapat dimuat</span>
            </div>
          ) : (
            <Image
              src={withResolvedAdminBasePath(getPortfolioImageSrc(preview) ?? preview)}
              alt="Preview"
              fill
              unoptimized
              sizes="(max-width: 1280px) 100vw, 33vw"
              onError={() => setImageFailed(true)}
              className="object-cover"
            />
          )}
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus cover image"
            title="Hapus cover image"
            className="absolute right-2 top-2 z-10 rounded-full bg-destructive p-2 text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted/80 transition">
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <span className="text-sm text-muted-foreground">
            Upload JPG, PNG, WebP, atau AVIF (maks. 5 MB)
          </span>
          <input
            type="file"
            accept="image/avif,image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}