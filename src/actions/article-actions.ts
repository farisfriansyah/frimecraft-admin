// src/actions/article-actions.ts
"use server";

import { db } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/session";
import { hasPermission } from "@/src/lib/rbac";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs/promises";
import path from "path";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/\-+/g, "-");
}

async function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  try {
    await mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") throw error;
  }
}

async function deletePhysicalFile(imageUrl: string | null) {
  if (!imageUrl) return;
  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    await fs.access(filePath).catch(() => null);
    await fs.unlink(filePath);
  } catch (err) {
    console.error("⚠ Gagal menghapus gambar:", err);
  }
}

export async function createArticleAction(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const canCreate = await hasPermission(session.userId, "article.create");
  if (!canCreate) throw new Error("Akses ditolak");

  const title = (formData.get("title") as string) || "Untitled";
  let slug = (formData.get("slug") as string) || "";
  if (!slug) slug = `${slugify(title)}-${Date.now()}`;

  const imageFile = formData.get("featuredImage") as File | null;
  let featuredImage: string | null = null;
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "articles", filename);
    await ensureDirectoryExists(filepath);
    await writeFile(filepath, buffer);
    featuredImage = `/uploads/articles/${filename}`;
  }

  const excerpt = (formData.get("excerpt") as string) || null;
  const content = (formData.get("content") as string) || "";
  const isPublished = formData.get("isPublished") === "true";
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const keywords = (formData.get("keywords") as string) || null;
  const tags = (formData.get("tags") as string) || null;

  const article = await db.article.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      isPublished,
      seoTitle,
      seoDescription,
      keywords,
      tags,
      authorId: session.userId,
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  return article;
}

export async function updateArticleAction(id: number, formData: FormData) {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");

  const canUpdate = await hasPermission(session.userId, "article.update");
  if (!canUpdate) throw new Error("Akses ditolak");

  const title = (formData.get("title") as string) || "Untitled";
  let slug = (formData.get("slug") as string) || "";
  if (!slug) slug = `${slugify(title)}-${Date.now()}`;

  const imageFile = formData.get("featuredImage") as File | null;
  let featuredImage: string | undefined = undefined;
  
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${imageFile.name.replace(/\s+/g, "-")}`;
    const filepath = path.join(process.cwd(), "public", "uploads", "articles", filename);
    await ensureDirectoryExists(filepath);
    await writeFile(filepath, buffer);
    featuredImage = `/uploads/articles/${filename}`;

    // Delete old image if exists
    const oldArticle = await db.article.findUnique({ where: { id }, select: { featuredImage: true } });
    if (oldArticle?.featuredImage) await deletePhysicalFile(oldArticle.featuredImage);
  }

  const excerpt = (formData.get("excerpt") as string) || null;
  const content = (formData.get("content") as string) || "";
  const isPublished = formData.get("isPublished") === "true";
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDescription = (formData.get("seoDescription") as string) || null;
  const keywords = (formData.get("keywords") as string) || null;
  const tags = (formData.get("tags") as string) || null;

  const updated = await db.article.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt,
      content,
      featuredImage: featuredImage ?? undefined,
      isPublished,
      seoTitle,
      seoDescription,
      keywords,
      tags,
    },
  });

  revalidatePath("/admin/articles");
  revalidatePath("/articles");
  return updated;
}

export async function deleteArticleAction(id: number | string) {
  try {
    const session = await getSession();
    if (!session?.userId) return { success: false, error: "Unauthorized" };

    const canDelete = await hasPermission(session.userId, "article.delete");
    if (!canDelete) return { success: false, error: "Akses ditolak" };

    const articleId = Number(id);
    if (isNaN(articleId)) return { success: false, error: "ID tidak valid" };

    const article = await db.article.findUnique({ where: { id: articleId }, select: { featuredImage: true } });
    if (article?.featuredImage) await deletePhysicalFile(article.featuredImage);

    await db.article.delete({ where: { id: articleId } });

    revalidatePath("/admin/articles");
    revalidatePath("/articles");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Gagal menghapus artikel" };
  }
}

