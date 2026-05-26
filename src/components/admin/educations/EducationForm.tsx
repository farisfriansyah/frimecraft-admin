// src/components/admin/educations/EducationForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Tambahkan Save di sini:
import { ArrowLeft, GraduationCap, Calendar, Loader2, Save } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../portfolios/RichTextEditor";
import { createEducationAction, updateEducationAction } from "@/src/actions/education-actions";
import { Education } from "@prisma/client";

const schema = z.object({
  institution: z.string().min(1, "Institusi wajib diisi"),
  degree: z.string().nullable().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
}).refine((data) => {
  if (!data.isCurrent && data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
  path: ["endDate"],
});

type EducationFormValues = z.infer<typeof schema>;

export default function EducationForm({ education, mode }: { education?: Education; mode: "create" | "edit" }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      institution: education?.institution || "",
      degree: education?.degree || "",
      description: education?.description || "",
      startDate: education?.startDate ? new Date(education.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: education?.endDate ? new Date(education.endDate).toISOString().split('T')[0] : "",
      isCurrent: education ? !education.endDate : false,
    },
  });

  const isCurrent = watch("isCurrent");

  const onSubmit = async (data: EducationFormValues, saveAndAddAnother = false) => {
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
        if (saveAndAddAnother) {
          router.push("/admin/educations/create");
          router.refresh();
        } else {
          router.push("/admin/educations");
          router.refresh();
        }
      } else {
        toast.error(res.error || "Gagal menyimpan data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    }
  };

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d, false))} className="grid gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/educations"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Pendidikan</h1>
        </div>

        {/* Card 1: Informasi Institusi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Informasi Institusi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <Label>Institusi <span className="text-destructive">*</span></Label>
              <Input {...register("institution")} placeholder="Contoh: Universitas Indonesia" />
              {errors.institution && <p className="text-sm text-destructive">{errors.institution.message}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Gelar/Jurusan</Label>
              <Input {...register("degree")} placeholder="Contoh: S.Kom - Teknik Informatika" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Durasi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Durasi Waktu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input type="date" {...register("startDate")} />
              </div>
              <div className="space-y-2">
                <Label>Tanggal Selesai</Label>
                <Input type="date" {...register("endDate")} disabled={isCurrent} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="isCurrent" 
                checked={isCurrent} 
                onCheckedChange={(c) => {
                    setValue("isCurrent", !!c);
                    if (c) setValue("endDate", "");
                }} 
              />
              <Label htmlFor="isCurrent" className="cursor-pointer">Saat ini sedang menempuh pendidikan</Label>
            </div>
            {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Deskripsi / Pencapaian</Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      {/* Sidebar Aksi */}
      <div className="lg:col-span-4">
        <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Simpan Pendidikan
          </Button>

          {!isEdit && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
              onClick={handleSubmit((d) => onSubmit(d, true))}
            >
              Simpan & Tambah Lagi
            </Button>
          )}

          <Button variant="ghost" asChild className="w-full">
            <Link href="/admin/educations">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}