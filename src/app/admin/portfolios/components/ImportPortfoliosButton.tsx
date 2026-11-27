"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { importPortfoliosAction } from "@/src/actions/portfolio-actions";
import { Button } from "@/src/app/ui/button";
import portfolioImportSample from "../sample.json";

function downloadPortfolioSample() {
  const blob = new Blob([JSON.stringify(portfolioImportSample, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sample.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ImportPortfoliosButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const router = useRouter();

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file JSON maksimal 5 MB.");
      return;
    }

    if (!window.confirm("Portfolio dalam file JSON akan ditambahkan sebagai data baru dan gambar akan dikosongkan. Lanjutkan?")) {
      return;
    }

    setIsImporting(true);
    try {
      const result = await importPortfoliosAction(await file.text());
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`${result.count} portfolio berhasil diimpor. Gambar dapat ditambahkan dari halaman edit.`);
      router.refresh();
    } catch (error) {
      console.error("Import portfolios error:", error);
      toast.error(error instanceof Error ? error.message : "Gagal mengimpor portfolio.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={downloadPortfolioSample}
      >
        <Download className="mr-2 h-5 w-5" />
        Download sample.json
      </Button>
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={isImporting}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="mr-2 h-5 w-5" />
        {isImporting ? "Mengimpor..." : "Import Portfolio JSON"}
      </Button>
    </>
  );
}
