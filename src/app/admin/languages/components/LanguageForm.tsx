"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Language } from "@prisma/client";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
// Gunakan path langsung dari root alias @/
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/app/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
// Perbaiki import ini (jangan pakai @/src/...)
import { createLanguageAction, updateLanguageAction } from "@/src/actions/language-actions";

const PROFICIENCY_LEVELS = [
  { label: "Basic", value: "Basic" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
  { label: "Fluent", value: "Fluent" },
  { label: "Native", value: "Native" },
];

const schema = z.object({
  name: z.string().min(1, "Nama bahasa wajib diisi"),
  // Ubah ke empty string menjadi null agar database menerimanya
  proficiency: z.string().nullable().optional().or(z.literal("")),
});

type LanguageFormValues = z.infer<typeof schema>;

export default function LanguageForm({ language, mode }: { language?: Language; mode: "create" | "edit" }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LanguageFormValues>({
    resolver: zodResolver(schema),
    defaultValues: language ? {
      name: language.name,
      proficiency: language.proficiency || "",
    } : { 
      name: "", 
      proficiency: "" 
    },
  });

  const onSubmit = async (data: LanguageFormValues, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      
      // Sanitasi data
      formData.append("name", data.name);
      if (data.proficiency) {
        formData.append("proficiency", data.proficiency);
      }

      const res = isEdit && language
        ? await updateLanguageAction(language.id, formData)
        : await createLanguageAction(formData);

      if (res.success) {
        toast.success("Berhasil disimpan!");
        if (saveAndAddAnother) {
            router.push("/admin/languages/create");
            router.refresh();
        } else {
            router.push("/admin/languages");
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
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="grid gap-10 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/languages"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Bahasa</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama Bahasa <span className="text-destructive">*</span></Label>
            <Input {...register("name")} placeholder="Contoh: Indonesia" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tingkat Kemampuan</Label>
            <Controller
              control={control}
              name="proficiency"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tingkat kemampuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-4">
        <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Bahasa"}
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
            <Link href="/admin/languages">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}