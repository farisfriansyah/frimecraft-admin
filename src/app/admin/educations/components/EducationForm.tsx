// src/components/admin/educations/EducationForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Checkbox } from "@/src/app/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/ui/card";
// Tambahkan Save di sini:
import { ArrowLeft, GraduationCap, Calendar, Loader2, Save } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../../portfolios/components/RichTextEditor";
import { createEducationAction, updateEducationAction } from "@/src/actions/education-actions";

type EducationRecord = {
  id: number;
  institution: string;
  degree?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  description?: string | null;
  isCurrent?: boolean;
  slug?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keywords?: string | null;
  tags?: string | null;
};

const schema = z.object({
  institution: z.string().min(1, "Institusi wajib diisi"),
  institutionEn: z.string().nullable().optional(),
  degree: z.string().nullable().optional(),
  degreeEn: z.string().nullable().optional(),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  seoTitle: z.string().max(60, "Maksimal 60 karakter untuk SEO").nullable().optional(),
  seoDescription: z.string().max(160, "Maksimal 160 karakter untuk SEO").nullable().optional(),
  keywords: z.string().max(300, "Maksimal 300 karakter").nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
}).refine((data) => {
  if (!data.isCurrent && data.endDate && data.startDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
  path: ["endDate"],
});

type EducationFormValues = Omit<z.infer<typeof schema>, 'isCurrent'> & { isCurrent?: boolean };

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

export default function EducationForm({ education, mode }: { education?: EducationRecord; mode: "create" | "edit" }) {
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
      institutionEn: (education as any)?.institutionEn || "",
      degree: education?.degree || "",
      degreeEn: (education as any)?.degreeEn || "",
      description: education?.description || "",
      startDate: education?.startDate ? new Date(education.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: education?.endDate ? new Date(education.endDate).toISOString().split('T')[0] : "",
      isCurrent: education ? !education.endDate : false,
      slug: education?.slug || "",
      descriptionEn: (education as any)?.descriptionEn || "",
      seoTitle: education?.seoTitle || "",
      seoDescription: education?.seoDescription || "",
      keywords: education?.keywords || "",
      tags: education?.tags ? education.tags.split(",").map((t) => t.trim()) : [],
    },
  });

  const isCurrent = watch("isCurrent");
  const slugValue = watch("slug");
  const seoTitleLength = watch("seoTitle")?.length || 0;
  const seoDescriptionLength = watch("seoDescription")?.length || 0;
  const keywordsLength = watch("keywords")?.length || 0;

  const onSubmit = async (data: EducationFormValues, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(","));
          } else {
            formData.append(key, String(value));
          }
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
    } catch {
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
              <Input 
                {...register("institution")} 
                placeholder="Contoh: Universitas Indonesia"
                onChange={(e) => {
                  register("institution").onChange?.(e);
                  if (!slugValue) {
                    setValue("slug", generateSlugFromTitle(e.target.value));
                  }
                }}
              />
              {errors.institution && <p className="text-sm text-destructive">{errors.institution.message}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Institusi (EN)</Label>
              <Input {...register("institutionEn")} placeholder="English institution name" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Gelar/Jurusan</Label>
              <Input {...register("degree")} placeholder="Contoh: S.Kom - Teknik Informatika" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Degree / Major (EN)</Label>
              <Input {...register("degreeEn")} placeholder="Example: Bachelor of Computer Science" />
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

        <div className="space-y-2">
          <Label>Description / Achievements (EN)</Label>
          <Controller
            control={control}
            name="descriptionEn"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Card 3: SEO Fields */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL-friendly)</Label>
              <Input 
                id="slug"
                {...register("slug")} 
                placeholder="slug-institusi"
                className="font-mono"
                onChange={(e) => {
                  register("slug").onChange?.(e);
                }}
              />
              <p className="text-xs text-muted-foreground">Auto-generated dari institusi, tapi bisa diedit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoTitle">SEO Title</Label>
              <Input 
                id="seoTitle"
                {...register("seoTitle")} 
                placeholder="Judul untuk search engines (max 60 char)"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{seoTitleLength}/60 karakter</span>
                <span>{seoTitleLength > 60 ? "❌ Terlalu panjang" : "✅"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription">Meta Description</Label>
              <textarea 
                id="seoDescription"
                {...register("seoDescription")} 
                placeholder="Deskripsi untuk preview di search engines (max 160 char)"
                rows={2}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{seoDescriptionLength}/160 karakter</span>
                <span>{seoDescriptionLength > 160 ? "❌ Terlalu panjang" : "✅"}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords / Kata Kunci</Label>
              <textarea 
                id="keywords"
                {...register("keywords")} 
                placeholder="Kata kunci yang relevan, pisahkan dengan koma (max 300 char)"
                rows={2}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{keywordsLength}/300 karakter</span>
              </div>
            </div>
          </CardContent>
        </Card>
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