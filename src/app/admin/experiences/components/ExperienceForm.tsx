// src/components/admin/experiences/ExperienceForm.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/ui/select";
import { ArrowLeft, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../../portfolios/components/RichTextEditor";
import CompanySelect from "@/src/app/admin/common/CompanySelect";
import { TagsInput } from "@/src/app/ui/tags-input";
import { createExperienceAction, updateExperienceAction } from "@/src/actions/experience-actions";
import { WorkExperience, Company } from "@prisma/client";

const schema = z.object({
  position: z.string().min(2, "Posisi wajib diisi"),
  positionEn: z.string().nullable().optional(),
  slug: z.string().optional(),
  companyId: z.number().nullable(),
  location: z.string().nullable().optional(),
  startMonth: z.coerce.number().min(1).max(12),
  startYear: z.coerce.number().min(1900),
  endMonth: z.coerce.number().min(1).max(12).nullable().optional(),
  endYear: z.coerce.number().min(1900).nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  tags: z.array(z.string()),
  seoTitle: z.string().max(60, "Maksimal 60 karakter untuk SEO").optional(),
  seoDescription: z.string().max(160, "Maksimal 160 karakter untuk SEO").optional(),
  keywords: z.string().max(300, "Maksimal 300 karakter").optional(),
}).refine(data => {
  if (data.isCurrent) return true;
  if (data.endYear && data.endMonth && data.startYear && data.startMonth) {
    return (data.endYear > data.startYear) || (data.endYear === data.startYear && data.endMonth >= data.startMonth);
  }
  return true;
}, { message: "Tanggal selesai tidak valid", path: ["endMonth"] });

function generateSlugFromPosition(position: string): string {
  return position
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

type FormData = z.infer<typeof schema>;

type Props = {
  experience?: WorkExperience & { company: Company | null };
  companies: { id: number; name: string }[];
  mode: "create" | "edit";
};

export default function ExperienceForm({ experience, companies, mode }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: experience ? {
      position: experience.position,
      positionEn: (experience as any).positionEn || "",
      slug: experience.slug || "",
      companyId: experience.companyId,
      location: experience.location,
      startMonth: experience.startMonth,
      startYear: experience.startYear,
      endMonth: experience.endMonth,
      endYear: experience.endYear,
      isCurrent: experience.isCurrent,
      description: experience.description,
      descriptionEn: (experience as any).descriptionEn || "",
      tags: experience.tags ?? [],
      seoTitle: experience.seoTitle || "",
      seoDescription: experience.seoDescription || "",
      keywords: experience.keywords || "",
    } : {
      position: "",
      positionEn: "",
      slug: "",
      companyId: null,
      location: "",
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: null,
      endYear: null,
      isCurrent: false,
      description: "",
      descriptionEn: "",
      tags: [],
      seoTitle: "",
      seoDescription: "",
      keywords: "",
    },
  });

  const isCurrent = watch("isCurrent");
  const positionValue = watch("position");
  const slugValue = watch("slug");
  const seoTitleLength = watch("seoTitle")?.length || 0;
  const seoDescriptionLength = watch("seoDescription")?.length || 0;
  const keywordsLength = watch("keywords")?.length || 0;

  const onSubmit = async (data: FormData, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "tags" && Array.isArray(value)) {
            formData.append("tags", value.join(","));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const res = isEdit && experience
        ? await updateExperienceAction(experience.id, formData)
        : await createExperienceAction(formData);

      if (res.success) {
        toast.success("Berhasil disimpan!");
        if (saveAndAddAnother) {
            router.push("/admin/experiences/create");
            router.refresh();
        } else {
            router.push("/admin/experiences");
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/experiences"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Pengalaman</h1>
        </div>

        {/* Card 1: Informasi Dasar */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Informasi Posisi</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 col-span-2">
              <Label>Posisi <span className="text-destructive">*</span></Label>
              <Input 
                {...register("position")}
                onChange={(e) => {
                  register("position").onChange?.(e);
                  if (!slugValue) {
                    setValue("slug", generateSlugFromPosition(e.target.value));
                  }
                }}
              />
              {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Slug (URL-friendly)</Label>
              <Input {...register("slug")} placeholder="slug-posisi" className="font-mono" />
              <p className="text-xs text-muted-foreground">Auto-generated dari posisi, tapi bisa diedit</p>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Posisi (EN)</Label>
              <Input {...register("positionEn")} placeholder="English position title" />
            </div>
            <div className="space-y-2">
              <Label>Perusahaan</Label>
              <CompanySelect companies={companies} value={watch("companyId")} onChange={(id) => setValue("companyId", id)} />
            </div>
            <div className="space-y-2">
              <Label>Lokasi</Label>
              <Input {...register("location")} placeholder="Jakarta, Indonesia" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Durasi */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Durasi Waktu</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mulai</Label>
                <div className="flex gap-2">
                  <Input type="number" {...register("startMonth", { valueAsNumber: true })} placeholder="Bulan" />
                  <Input type="number" {...register("startYear", { valueAsNumber: true })} placeholder="Tahun" />
                </div>
              </div>
              {!isCurrent && (
                <div className="space-y-2">
                  <Label>Selesai</Label>
                  <div className="flex gap-2">
                    <Input type="number" {...register("endMonth", { valueAsNumber: true })} placeholder="Bulan" />
                    <Input type="number" {...register("endYear", { valueAsNumber: true })} placeholder="Tahun" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="isCurrent" checked={isCurrent} onCheckedChange={(c) => setValue("isCurrent", !!c)} />
              <Label htmlFor="isCurrent">Masih bekerja di posisi ini</Label>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Label>Deskripsi Pekerjaan</Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Description (EN)</Label>
          <Controller
            control={control}
            name="descriptionEn"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label>Keahlian (Tags)</Label>
          <TagsInput value={watch("tags") ?? []} onChange={(t) => setValue("tags", t)} />
        </div>

        {/* SEO & Meta Tags */}
        <Card>
          <CardHeader>
            <CardTitle>SEO & Meta Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {isSubmitting ? "Menyimpan..." : "Simpan Pengalaman"}
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
            <Link href="/admin/experiences">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}