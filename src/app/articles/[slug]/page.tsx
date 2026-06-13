// src/app/articles/[slug]/page.tsx
import { db } from "@/src/lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props { params: { slug: string } }

export default async function ArticleViewPage({ params }: Props) {
  const { slug } = params;
  const article = await db.article.findUnique({ where: { slug } });
  if (!article) notFound();

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-4xl font-bold">{article.title}</h1>
      <p className="text-muted-foreground mt-2">{article.excerpt}</p>
      <div className="prose prose-lg mt-6" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  );
}
