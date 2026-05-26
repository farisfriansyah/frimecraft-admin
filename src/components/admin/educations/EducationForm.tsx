"use client";

import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Education } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "../portfolios/RichTextEditor";
import { createEducationAction, updateEducationAction } from "@/src/actions/education-actions";

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

  // Fix: Explicit SubmitHandler typing
  const onSubmit: SubmitHandler<EducationFormValues> = async (data) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/educations"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Pendidikan</h1>
        </div>

        <Card className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Institusi <span className="text-destructive">*</span></Label>
              <Input {...register("institution")} placeholder="Contoh: Universitas Indonesia" />
              {errors.institution && <p className="text-sm text-destructive">{errors.institution.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Gelar</Label>
              <Input {...register("degree")} placeholder="Contoh: S.Kom" />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tanggal Selesai</Label>
              <Input type="date" {...register("endDate")} disabled={isCurrent} />
              <div className="flex items-center space-x-2 mt-2">
                <Controller
                  control={control}
                  name="isCurrent"
                  render={({ field }) => (
                    <Checkbox
                      id="isCurrent"
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) setValue("endDate", "");
                      }}
                    />
                  )}
                />
                <Label htmlFor="isCurrent" className="font-normal cursor-pointer">
                  Saat ini sedang menempuh pendidikan
                </Label>
              </div>
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>
        </Card>

        <div className="space-y-2">
          <Label>Deskripsi</Label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <RichTextEditor value={field.value || ""} onChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Pendidikan"}
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/admin/educations">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}