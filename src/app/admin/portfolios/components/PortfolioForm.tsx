// src/components/admin/portfolios/PortfolioForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Checkbox } from "@/src/app/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RichTextEditor from "./RichTextEditor";
import CompanySelect from "@/src/app/admin/common/CompanySelect";
import ImageUpload from "./ImageUpload";
import { TagsInput } from "@/src/app/ui/tags-input";
import { createPortfolioAction, updatePortfolioAction } from "@/src/actions/portfolio-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/ui/card";

const schema = z.object({
  title: z.string().min(3, "Minimal 3 karakter"),
  slug: z.string().optional(),
  sortNumber: z.number().int().nullable().optional(),
  description: z.string().optional(),
  image: z.instanceof(File).optional(),
  projectUrl: z.string().url().optional().or(z.literal("")),
  workForId: z.number().nullable(),
  workAtId: z.number().nullable(),
  tags: z.array(z.string()),
  featured: z.boolean(),
  isDisabled: z.boolean(),
  seoTitle: z.string().max(60, "Maksimal 60 karakter untuk SEO").optional(),
  seoDescription: z.string().max(160, "Maksimal 160 karakter untuk SEO").optional(),
  keywords: z.string().max(300, "Maksimal 300 karakter").optional(),
});

type FormData = z.infer<typeof schema>;

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

type Props = {
  portfolio?: {
    id: number;
    title: string;
    slug?: string | null;
    sortNumber?: number | null;
    description?: string | null;
    imageUrl?: string | null;
    projectUrl?: string | null;
    workForId?: number | null;
    workAtId?: number | null;
    tags?: string | null;
    featured: boolean;
    isDisabled: boolean;
    seoTitle?: string | null;
    seoDescription?: string | null;
    keywords?: string | null;
  };
  companies: { id: number; name: string }[];
  mode: "create" | "edit";
};

export default function PortfolioForm({ portfolio, companies, mode }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: portfolio
      ? {
          title: portfolio.title,
          slug: portfolio.slug || "",
          sortNumber: portfolio.sortNumber ?? null,
          description: portfolio.description || "",
          projectUrl: portfolio.projectUrl || "",
          workForId: portfolio.workForId ?? null,
          workAtId: portfolio.workAtId ?? null,
          tags: portfolio.tags ? portfolio.tags.split(",").map((t) => t.trim()) : [],
          featured: portfolio.featured,
          isDisabled: portfolio.isDisabled,
          seoTitle: portfolio.seoTitle || "",
          seoDescription: portfolio.seoDescription || "",
          keywords: portfolio.keywords || "",
        }
      : {
          tags: [],
          featured: false,
          isDisabled: false,
          slug: "",
          sortNumber: null,
          seoTitle: "",
          seoDescription: "",
          keywords: "",
        },
  });

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const seoTitleLength = watch("seoTitle")?.length || 0;
  const seoDescriptionLength = watch("seoDescription")?.length || 0;
  const keywordsLength = watch("keywords")?.length || 0;

  const onSubmit = async (data: FormData, saveAndAddAnother = false) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value instanceof File) formData.append("image", value);
          else if (Array.isArray(value)) formData.append("tags", value.join(","));
          else formData.append(key, String(value));
        }
      });

      if (isEdit && portfolio) {
        await updatePortfolioAction(portfolio.id, formData);
        toast.success("Portfolio berhasil diupdate!");
      } else {
        await createPortfolioAction(formData);
        toast.success("Portfolio berhasil ditambahkan!");
      }

      if (saveAndAddAnother) {
        router.push("/admin/portfolios/create");
        toast("Siap tambah portfolio baru!", { icon: "rocket" });
      } else {
        router.push("/admin/portfolios");
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan portfolio");
    }
  };

  return (
    <div className="overflow-y-hidden">
      {/* Header Fixed */}
      <div className="relative top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/portfolios">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tambah"} Portfolio</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-10">
        <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="grid gap-10 lg:grid-cols-12">
          {/* Left Column - Form Fields */}
          <div className="space-y-8 lg:col-span-8">
            {/* Title & Slug */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Judul Project <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Contoh: Dashboard SaaS Modern dengan Next.js 14"
                className="text-lg font-medium h-12"
                onChange={(e) => {
                  register("title").onChange?.(e);
                  if (!slugValue) {
                    setValue("slug", generateSlugFromTitle(e.target.value));
                  }
                }}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL-friendly)</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="slug-project"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">Auto-generated dari judul, tapi bisa diedit</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortNumber">Sort Number</Label>
              <Input
                id="sortNumber"
                type="number"
                value={watch("sortNumber") ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  setValue("sortNumber", raw === "" ? null : Number(raw));
                }}
                placeholder="Kosongkan untuk urutan default terbaru"
              />
              <p className="text-xs text-muted-foreground">Angka lebih kecil tampil lebih dulu. Jika kosong, fallback terbaru ke terlama.</p>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Deskripsi</Label>
              <RichTextEditor value={watch("description") || ""} onChange={(v) => setValue("description", v)} />
            </div>

            {/* Project URL */}
            <div className="space-y-2">
              <Label htmlFor="projectUrl" className="text-base font-medium">Project URL</Label>
              <Input
                id="projectUrl"
                {...register("projectUrl")}
                placeholder="https://example.com"
                className="font-mono"
                value={watch("projectUrl") || "https://"}
              />
            </div>

            {/* Client & Employer */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-base font-medium">Work For (Client)</Label>
                <CompanySelect
                  companies={companies}
                  value={watch("workForId") ?? null}
                  onChange={(id) => setValue("workForId", id)}
                  placeholder="Pilih atau buat client"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-base font-medium">Work At (Employer)</Label>
                <CompanySelect
                  companies={companies}
                  value={watch("workAtId") ?? null}
                  onChange={(id) => setValue("workAtId", id)}
                  placeholder="Pilih atau buat perusahaan"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tags</Label>
              <TagsInput value={watch("tags") || []} onChange={(tags) => setValue("tags", tags)} />
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

            {/* Options */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="featured"
                  checked={watch("featured")}
                  onCheckedChange={(c) => setValue("featured", c === true)}
                />
                <Label htmlFor="featured" className="font-medium cursor-pointer">
                  Featured di homepage
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="disabled"
                  checked={watch("isDisabled")}
                  onCheckedChange={(c) => setValue("isDisabled", c === true)}
                />
                <Label htmlFor="disabled" className="font-medium cursor-pointer">
                  Nonaktifkan
                </Label>
              </div>
            </div>
          </div>

          {/* Right Column - Image + Actions */}
          <div className="space-y-8 lg:col-span-4">
            {/* Cover Image */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Cover Image</Label>
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
                <ImageUpload
                  onChange={(file) => setValue("image", file)}
                  previewUrl={portfolio?.imageUrl}
                />
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : isEdit ? "Update Portfolio" : "Simpan Portfolio"}
              </Button>

              {!isEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                >
                  Simpan & Tambah Lagi
                </Button>
              )}

              <Button variant="ghost" asChild className="w-full">
                <Link href="/admin/portfolios">Batal</Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}