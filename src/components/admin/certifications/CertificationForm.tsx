"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Certification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createCertificationAction, updateCertificationAction } from "@/src/actions/certification-actions";

const schema = z.object({
  title: z.string().min(1, "Judul wajib diisi"),
  issuer: z.string().min(1, "Penerbit wajib diisi"),
  issueDate: z.string().min(1, "Tanggal wajib diisi"),
  url: z.string().url().optional().or(z.literal("")),
});

type CertificationFormValues = z.infer<typeof schema>;

export default function CertificationForm({ certification, mode }: { certification?: Certification; mode: "create" | "edit" }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Perbaikan: Penanganan null untuk defaultValues agar sesuai dengan tipe data Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CertificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: certification ? {
      title: certification.title,
      issuer: certification.issuer || "", // Convert null to ""
      issueDate: certification.issueDate ? certification.issueDate.toISOString().split("T")[0] : "", // Handle date null
      url: certification.url || "", // Convert null to ""
    } : { title: "", issuer: "", issueDate: "", url: "" },
  });

  // Perbaikan: Tipe data eksplisit untuk data
  const onSubmit = async (data: CertificationFormValues, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Perbaikan: Konversi ID ke string karena Action biasanya mengharapkan string
      const res = isEdit && certification
        ? await updateCertificationAction(String(certification.id), formData)
        : await createCertificationAction(formData);

      if (res.success) {
        toast.success("Sertifikasi berhasil disimpan!");
        if (saveAndAddAnother) {
            router.push("/admin/certifications/create");
            router.refresh();
        } else {
            router.push("/admin/certifications");
            router.refresh();
        }
      } else {
        toast.error(res.error || "Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  return (
    // Perbaikan: Gunakan handleSubmit dengan tipe yang benar
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/certifications"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Sertifikasi</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Judul Sertifikasi <span className="text-destructive">*</span></Label>
            <Input {...register("title")} placeholder="Contoh: AWS Solutions Architect" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Penerbit (Issuer) <span className="text-destructive">*</span></Label>
            <Input {...register("issuer")} placeholder="Contoh: Amazon Web Services" />
            {errors.issuer && <p className="text-sm text-destructive">{errors.issuer.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>Tanggal <span className="text-destructive">*</span></Label>
            <Input type="date" {...register("issueDate")} />
            {errors.issueDate && <p className="text-sm text-destructive">{errors.issueDate.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label>URL Kredensial</Label>
            <Input {...register("url")} placeholder="https://..." />
            {errors.url && <p className="text-sm text-destructive">{errors.url.message}</p>}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Sertifikat"}
          </Button>
          
          {!isEdit && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
              onClick={handleSubmit((data) => onSubmit(data, true))}
            >
              Simpan & Tambah Lagi
            </Button>
          )}

          <Button variant="ghost" asChild className="w-full">
            <Link href="/admin/certifications">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}