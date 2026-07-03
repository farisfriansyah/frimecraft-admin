"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/src/app/ui/button";
import { Input } from "@/src/app/ui/input";
import { Label } from "@/src/app/ui/label";
import { Checkbox } from "@/src/app/ui/checkbox";
import { ArrowLeft, FileText, Loader2, Save } from "lucide-react";
import ArticleRichTextEditor from "@/src/app/admin/articles/components/ArticleRichTextEditor";
import ImageUpload from "@/src/app/admin/articles/components/ImageUpload";
import { createArticleAction, updateArticleAction } from "@/src/actions/article-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/app/ui/card";
import { TagsInput } from "@/src/app/ui/tags-input";

const schema = z.object({
  title: z.string().min(3, "Minimal 3 karakter").max(200, "Maksimal 200 karakter"),
  titleEn: z.string().max(200, "Maksimal 200 karakter").optional(),
  slug: z.string().optional(),
  sortNumber: z.number().int().nullable().optional(),
  excerpt: z.string().max(500, "Maksimal 500 karakter").optional(),
  excerptEn: z.string().max(500, "Maksimal 500 karakter").optional(),
  content: z.string().min(10, "Konten minimal 10 karakter").optional(),
  contentEn: z.string().optional(),
  featuredImage: z.instanceof(File).optional(),
  tags: z.array(z.string()).optional(),
  tagsEn: z.array(z.string()).optional(),
  keywords: z.string().max(300, "Maksimal 300 karakter").optional(),
  keywordsEn: z.string().max(300, "Maksimal 300 karakter").optional(),
  seoTitle: z.string().max(60, "Maksimal 60 karakter untuk SEO").optional(),
  seoTitleEn: z.string().max(60, "Maksimal 60 karakter untuk SEO").optional(),
  seoDescription: z.string().max(160, "Maksimal 160 karakter untuk SEO").optional(),
  seoDescriptionEn: z.string().max(160, "Maksimal 160 karakter untuk SEO").optional(),
  isPublished: z.boolean(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  article?: {
    id: number;
    title: string;
    titleEn?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    excerptEn?: string | null;
    content?: string | null;
    contentEn?: string | null;
    featuredImage?: string | null;
    tags?: string | null;
    tagsEn?: string | null;
    sortNumber?: number | null;
    keywords?: string | null;
    keywordsEn?: string | null;
    seoTitle?: string | null;
    seoTitleEn?: string | null;
    seoDescription?: string | null;
    seoDescriptionEn?: string | null;
    isPublished: boolean;
  };
  mode: "create" | "edit";
};

function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

export default function ArticleForm({ article, mode }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: article
      ? {
          title: article.title,
          titleEn: article.titleEn || "",
          slug: article.slug || "",
          sortNumber: article.sortNumber ?? null,
          excerpt: article.excerpt || "",
          excerptEn: article.excerptEn || "",
          content: article.content || "",
          contentEn: article.contentEn || "",
          tags: article.tags ? article.tags.split(",").map((t) => t.trim()) : [],
          tagsEn: article.tagsEn ? article.tagsEn.split(",").map((t) => t.trim()) : [],
          keywords: article.keywords || "",
          keywordsEn: article.keywordsEn || "",
          seoTitle: article.seoTitle || "",
          seoTitleEn: article.seoTitleEn || "",
          seoDescription: article.seoDescription || "",
          seoDescriptionEn: article.seoDescriptionEn || "",
          isPublished: article.isPublished,
        }
      : { isPublished: false, sortNumber: null, excerpt: "", excerptEn: "", content: "", contentEn: "", tags: [], tagsEn: [], keywords: "", keywordsEn: "", seoTitle: "", seoTitleEn: "", seoDescription: "", seoDescriptionEn: "" },
  });

  const titleValue = watch("title");
  const slugValue = watch("slug");
  const contentLength = watch("content")?.length || 0;
  const excerptLength = watch("excerpt")?.length || 0;
  const keywordsLength = watch("keywords")?.length || 0;
  const seoTitleLength = watch("seoTitle")?.length || 0;
  const seoDescriptionLength = watch("seoDescription")?.length || 0;

  const onSubmit = async (data: FormData) => {
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          if (v instanceof File) fd.append(k, v);
          else if (Array.isArray(v)) fd.append(k, v.join(","));
          else fd.append(k, String(v));
        }
      });

      if (isEdit && article) {
        await updateArticleAction(article.id, fd);
        toast.success("Artikel berhasil diupdate!");
      } else {
        await createArticleAction(fd);
        toast.success("Artikel berhasil dibuat!");
      }

      router.push("/admin/articles");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan artikel");
    }
  };

  return (
    <div>
      <div className="relative top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/articles">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isEdit ? "Edit" : "Tulis"} Artikel</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            {/* Title & Slug */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Artikel <span className="text-destructive">*</span></Label>
                  <Input 
                    id="title" 
                    {...register("title")} 
                    placeholder="Masukkan judul artikel yang menarik"
                    className="text-lg h-12 font-medium"
                    onChange={(e) => {
                      register("title").onChange?.(e);
                      if (!slugValue) {
                        setValue("slug", generateSlugFromTitle(e.target.value));
                      }
                    }}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{titleValue?.length || 0}/200 karakter</span>
                  </div>
                  {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL-friendly)</Label>
                  <Input 
                    id="slug" 
                    {...register("slug")} 
                    placeholder="slug-artikel"
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

                <div className="space-y-2">
                  <Label htmlFor="titleEn">Judul Artikel (EN)</Label>
                  <Input id="titleEn" {...register("titleEn")} placeholder="English article title" className="text-lg h-12 font-medium" />
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Gambar Sampul</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onChange={(file) => setValue("featuredImage", file)}
                  previewUrl={article?.featuredImage}
                />
              </CardContent>
            </Card>

            {/* Excerpt & Content */}
            <Card>
              <CardHeader>
                <CardTitle>Konten Artikel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Ringkasan / Excerpt <span className="text-muted-foreground text-xs">(preview di list)</span></Label>
                  <textarea 
                    {...register("excerpt")} 
                    placeholder="Tulis ringkasan singkat artikel (akan ditampilkan di halaman daftar)..."
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{excerptLength}/500 karakter</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Excerpt (EN)</Label>
                  <textarea
                    {...register("excerptEn")}
                    placeholder="English article excerpt"
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Isi Artikel <span className="text-muted-foreground text-xs">(rich text + image + code)</span></Label>
                  <ArticleRichTextEditor value={watch("content") || ""} onChange={(v) => setValue("content", v)} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{contentLength} karakter</span>
                  </div>
                  {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Content (EN)</Label>
                  <ArticleRichTextEditor value={watch("contentEn") || ""} onChange={(v) => setValue("contentEn", v)} />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <Label className="mb-3 block">Tambahkan tags untuk kategori artikel</Label>
                <TagsInput value={watch("tags") || []} onChange={(tags) => setValue("tags", tags)} />
                <Label className="mb-3 mt-6 block">Tags (EN)</Label>
                <TagsInput value={watch("tagsEn") || []} onChange={(tags) => setValue("tagsEn", tags)} />
              </CardContent>
            </Card>

            {/* SEO */}
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
                  <Label htmlFor="seoTitleEn">SEO Title (EN)</Label>
                  <Input id="seoTitleEn" {...register("seoTitleEn")} placeholder="English SEO title" />
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
                  <Label htmlFor="seoDescriptionEn">Meta Description (EN)</Label>
                  <textarea
                    id="seoDescriptionEn"
                    {...register("seoDescriptionEn")}
                    placeholder="English meta description"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="keywordsEn">Keywords (EN)</Label>
                  <textarea
                    id="keywordsEn"
                    {...register("keywordsEn")}
                    placeholder="English keywords, comma separated"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-20 space-y-3 rounded-lg border bg-card p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Status Publikasi</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <Checkbox 
                      id="isPublished" 
                      checked={watch("isPublished") as any} 
                      onCheckedChange={(c) => setValue("isPublished", c === true)} 
                    />
                    <div>
                      <Label htmlFor="isPublished" className="font-medium cursor-pointer">
                        {watch("isPublished") ? "✓ Publish" : "Draft"}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {watch("isPublished") 
                          ? "Visible di website" 
                          : "Admin only"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs space-y-2 text-muted-foreground">
                    <p>Mode: <span className="font-semibold text-foreground">{isEdit ? "Edit" : "Baru"}</span></p>
                    <p>Slug: <code className="bg-muted px-2 py-1 rounded text-xs">{slugValue || "auto"}</code></p>
                    <p>Tags: <span className="font-semibold">{(watch("tags") || []).length}</span></p>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Update Artikel" : "Publikasikan"}
                  </>
                )}
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/admin/articles">Batal</Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
