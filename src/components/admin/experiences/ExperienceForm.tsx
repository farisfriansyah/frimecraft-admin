"use client";

import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
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
  startMonth: z.number().min(1).max(12),
  startYear: z.number().min(1900),
  endMonth: z.number().min(1).max(12).nullable().optional(),
  endYear: z.number().min(1900).nullable().optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

type Props = {
  experience?: WorkExperience & { company: Company | null };
  companies: { id: number; name: string }[];
  mode: "create" | "edit";
};

// Helper: ekstrak bulan & tahun dari Date
function getMonthYear(date: Date | null | undefined) {
  if (!date) return { month: null, year: null };
  const d = new Date(date);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export default function ExperienceForm({ experience, companies, mode }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  // Mapping dari WorkExperience (Prisma) → FormData
  const defaultValues: FormData = experience
  ? {
      position: experience.position,       // ✅ langsung
      companyId: experience.companyId,     // ✅ langsung (Int?)
      location: experience.location,
      startMonth: experience.startMonth,   // ✅ langsung
      startYear: experience.startYear,     // ✅ langsung
      endMonth: experience.endMonth,
      endYear: experience.endYear,
      isCurrent: experience.isCurrent,
      description: experience.description,
      tags: experience.tags ?? [],         // ✅ String[] di schema
    }
  : {
      position: "",
      companyId: null,
      location: null,
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: null,
      endYear: null,
      isCurrent: false,
      description: null,
      tags: [],
    };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // Cast eksplisit untuk menyelesaikan mismatch tipe resolver
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues,
  });

  const isCurrent = watch("isCurrent");

  const onSubmit: Parameters<typeof handleSubmit>[0] = async (data) => {
    try {
      const formData = new FormData();
      (Object.entries(data) as [string, unknown][]).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "tags" && Array.isArray(value)) {
            formData.append("tags", value.join(","));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (isEdit && experience) {
        await updateExperienceAction(experience.id, formData);
        toast.success("Berhasil diupdate!");
      } else {
        await createExperienceAction(formData);
        toast.success("Berhasil ditambahkan!");
      }
      router.push("/admin/experiences");
      router.refresh();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan data"
      );
    }
  };

  return (
    <div className="container py-10 max-w-7xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/experiences">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit" : "Tambah"} Pengalaman
            </h1>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Posisi <span className="text-destructive">*</span>
              </Label>
              <Input {...register("position")} />
              {errors.position && (
                <p className="text-sm text-destructive">{errors.position.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Perusahaan</Label>
              <CompanySelect
                companies={companies}
                value={watch("companyId")}
                onChange={(id) => setValue("companyId", id)}
                placeholder="Pilih perusahaan"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Bulan Mulai</Label>
              <Input
                type="number"
                {...register("startMonth", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tahun Mulai</Label>
              <Input
                type="number"
                {...register("startYear", { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isCurrent"
              checked={isCurrent}
              onCheckedChange={(c) => setValue("isCurrent", !!c)}
            />
            <Label htmlFor="isCurrent">Masih bekerja di sini?</Label>
          </div>

          {!isCurrent && (
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bulan Selesai</Label>
                <Input
                  type="number"
                  {...register("endMonth", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tahun Selesai</Label>
                <Input
                  type="number"
                  {...register("endYear", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Deskripsi</Label>
            <RichTextEditor
              value={watch("description") ?? ""}
              onChange={(v) => setValue("description", v)}
            />
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>
            <TagsInput
              value={watch("tags") ?? []}
              onChange={(t) => setValue("tags", t)}
            />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Pengalaman"}
            </Button>
            <Button variant="ghost" asChild className="w-full">
              <Link href="/admin/experiences">Batal</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}