"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Education } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../portfolios/RichTextEditor"; // Sesuaikan path
import { createEducationAction, updateEducationAction } from "@/src/actions/education-actions";

const schema = z.object({
  institution: z.string().min(1, "Institusi wajib diisi"),
  degree: z.string().nullable().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

type EducationFormValues = z.infer<typeof schema>;

export default function EducationForm({ education, mode }: { education?: Education; mode: "create" | "edit" }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const form = useForm<EducationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: education ? {
      institution: education.institution,
      degree: education.degree || "",
      description: education.description || "",
      startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : "",
      endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : "",
    } : {
      institution: "",
      degree: "",
      description: "",
      startDate: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: EducationFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const res = isEdit && education
        ? await updateEducationAction(education.id, formData)
        : await createEducationAction(formData);

      if (res.success) {
        toast.success("Berhasil disimpan!");
        router.push("/admin/educations");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/educations"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Pendidikan</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Institusi <span className="text-destructive">*</span></Label>
            <Input {...form.register("institution")} />
            {form.formState.errors.institution && (
              <p className="text-sm text-destructive">{form.formState.errors.institution.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Gelar</Label>
            <Input {...form.register("degree")} />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tanggal Mulai</Label>
            <Input type="date" {...form.register("startDate")} />
          </div>
          <div className="space-y-2">
            <Label>Tanggal Selesai</Label>
            <Input type="date" {...form.register("endDate")} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Deskripsi</Label>
          {/* Menggunakan RichTextEditor agar konsisten dengan Portfolio */}
          <RichTextEditor 
            value={form.watch("description") || ""} 
            onChange={(v) => form.setValue("description", v)} 
          />
        </div>
      </div>

      {/* Sticky Sidebar */}
      <div className="lg:col-span-4">
        <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Pendidikan"}
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/admin/educations">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}