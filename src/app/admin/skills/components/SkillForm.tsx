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
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createSkillAction, updateSkillAction } from "@/src/actions/skill-actions";

// Konstanta kategori (bisa disesuaikan dengan kebutuhan database kamu)
const SKILL_CATEGORIES = ["Frontend", "Backend", "Database", "DevOps", "Design", "Tools"];

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

const schema = z.object({
  name: z.string().min(1, "Nama skill wajib diisi"),
  nameEn: z.string().optional(),
  slug: z.string().optional(),
  level: z.number().min(0).max(100),
  category: z.string().min(1, "Kategori wajib dipilih"),
  notes: z.string().nullable().optional(),
  notesEn: z.string().nullable().optional(),
  seoTitle: z.string().max(60, "Maksimal 60 karakter untuk SEO").optional(),
  seoDescription: z.string().max(160, "Maksimal 160 karakter untuk SEO").optional(),
  keywords: z.string().max(300, "Maksimal 300 karakter").optional(),
  tags: z.array(z.string()),
});

type SkillFormValues = z.infer<typeof schema>;

type Props = {
  skill?: Skill & {
    seoTitle?: string | null;
    seoDescription?: string | null;
    keywords?: string | null;
    tags?: string | null;
  };
  mode: "create" | "edit";
};

export default function SkillForm({ skill, mode }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: skill ? {
      name: skill.name,
      nameEn: (skill as any).nameEn || "",
      slug: skill.slug || "",
      level: skill.level || 50,
      category: (skill as any).category || "Frontend", 
      notes: skill.notes || "",
      notesEn: (skill as any).notesEn || "",
      seoTitle: skill.seoTitle || "",
      seoDescription: skill.seoDescription || "",
      keywords: skill.keywords || "",
      tags: skill.tags ? skill.tags.split(",").map((t) => t.trim()) : [],
    } : { 
      name: "", 
      nameEn: "",
      slug: "",
      level: 50,
      category: "Frontend",
      notes: "",
      notesEn: "",
      seoTitle: "",
      seoDescription: "",
      keywords: "",
      tags: [],
    },
  });

  const level = watch("level");
  const nameValue = watch("name");
  const slugValue = watch("slug");
  const seoTitleLength = watch("seoTitle")?.length || 0;
  const seoDescriptionLength = watch("seoDescription")?.length || 0;
  const keywordsLength = watch("keywords")?.length || 0;

  const onSubmit = async (data: SkillFormValues, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) formData.append(key, value.join(","));
          else formData.append(key, String(value));
        }
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
            <Input 
              {...register("name")} 
              placeholder="Contoh: React.js"
              onChange={(e) => {
                register("name").onChange?.(e);
                if (!slugValue) {
                  setValue("slug", generateSlugFromTitle(e.target.value));
                }
              }}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Nama Skill (EN)</Label>
            <Input {...register("nameEn")} placeholder="Example: React.js" />
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

        {/* Slug */}
        <div className="space-y-2">
          <Label>Slug (URL-friendly)</Label>
          <Input 
            {...register("slug")} 
            placeholder="nama-skill"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">Auto-generated dari nama skill, tapi bisa diedit</p>
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

        <div className="space-y-2">
          <Label>Additional Notes (EN)</Label>
          <Textarea {...register("notesEn")} placeholder="Explain relevant experience or certification..." />
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