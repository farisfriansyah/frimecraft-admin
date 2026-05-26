// src/components/admin/experiences/ExperienceForm.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Briefcase, Calendar } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../portfolios/RichTextEditor";
import CompanySelect from "@/src/components/admin/common/CompanySelect";
import { TagsInput } from "@/src/components/ui/tags-input";
import { createExperienceAction, updateExperienceAction } from "@/src/actions/experience-actions";
import { WorkExperience, Company } from "@prisma/client";

const schema = z.object({
  position: z.string().min(2, "Posisi wajib diisi"),
  companyId: z.number().nullable(),
  location: z.string().nullable().optional(),
  startMonth: z.coerce.number().min(1).max(12),
  startYear: z.coerce.number().min(1900),
  endMonth: z.coerce.number().min(1).max(12).nullable().optional(),
  endYear: z.coerce.number().min(1900).nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()),
}).refine(data => {
  if (data.isCurrent) return true;
  if (data.endYear && data.endMonth && data.startYear && data.startMonth) {
    return (data.endYear > data.startYear) || (data.endYear === data.startYear && data.endMonth >= data.startMonth);
  }
  return true;
}, { message: "Tanggal selesai tidak valid", path: ["endMonth"] });

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
    resolver: zodResolver(schema),
    defaultValues: experience ? {
      position: experience.position,
      companyId: experience.companyId,
      location: experience.location,
      startMonth: experience.startMonth,
      startYear: experience.startYear,
      endMonth: experience.endMonth,
      endYear: experience.endYear,
      isCurrent: experience.isCurrent,
      description: experience.description,
      tags: experience.tags ?? [],
    } : {
      position: "",
      companyId: null,
      location: "",
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: null,
      endYear: null,
      isCurrent: false,
      description: "",
      tags: [],
    },
  });

  const isCurrent = watch("isCurrent");

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
              <Input {...register("position")} />
              {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
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
          <Label>Keahlian (Tags)</Label>
          <TagsInput value={watch("tags") ?? []} onChange={(t) => setValue("tags", t)} />
        </div>
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