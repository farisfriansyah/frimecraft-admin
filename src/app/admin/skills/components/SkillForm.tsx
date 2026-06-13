"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skill } from "@prisma/client";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Textarea } from "@/src/app/ui/textarea";
import { Slider } from "@/src/app/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/app/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createSkillAction, updateSkillAction } from "@/src/actions/skill-actions";

// Konstanta kategori (bisa disesuaikan dengan kebutuhan database kamu)
const SKILL_CATEGORIES = ["Frontend", "Backend", "Database", "DevOps", "Design", "Tools"];

const schema = z.object({
  name: z.string().min(1, "Nama skill wajib diisi"),
  level: z.number().min(0).max(100),
  category: z.string().min(1, "Kategori wajib dipilih"),
  notes: z.string().nullable().optional(),
});

type SkillFormValues = z.infer<typeof schema>;

export default function SkillForm({ skill, mode }: { skill?: Skill; mode: "create" | "edit" }) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: skill ? {
      name: skill.name,
      level: skill.level || 50,
      category: (skill as any).category || "Frontend", 
      notes: skill.notes || "",
    } : { 
      name: "", 
      level: 50,
      category: "Frontend",
      notes: "" 
    },
  });

  const level = watch("level"); // Untuk memantau nilai slider secara real-time

  const onSubmit = async (data: SkillFormValues, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value));
      });

      const res = isEdit && skill
        ? await updateSkillAction(skill.id, formData)
        : await createSkillAction(formData);

      if (res.success) {
        toast.success("Skill berhasil disimpan!");
        if (saveAndAddAnother) {
            router.push("/admin/skills/create");
            router.refresh();
        } else {
            router.push("/admin/skills");
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
            <Link href="/admin/skills"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Skill</h1>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Nama Skill <span className="text-destructive">*</span></Label>
            <Input {...register("name")} placeholder="Contoh: React.js" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Kategori</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Level Slider */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Tingkat Kemahiran ({level}%)</Label>
            </div>
            <Controller
                control={control}
                name="level"
                render={({ field }) => (
                    <Slider
                        defaultValue={[field.value]}
                        max={100}
                        step={5}
                        onValueChange={(val) => field.onChange(val[0])}
                    />
                )}
            />
        </div>

        <div className="space-y-2">
          <Label>Catatan Tambahan</Label>
          <Textarea {...register("notes")} placeholder="Jelaskan pengalaman atau sertifikasi terkait..." />
        </div>
      </div>

      {/* Sticky Sidebar */}
      <div className="lg:col-span-4">
        <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Skill"}
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
            <Link href="/admin/skills">Batal</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}