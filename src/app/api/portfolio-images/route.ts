import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getLegacyPortfolioUploadDirectory, getPortfolioUploadDirectory } from "@/src/lib/portfolio-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const imageContentTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".bmp": "image/bmp",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function imageError(message: string, status: number) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

function isMissingFileError(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export async function GET(request: Request) {
  const filename = new URL(request.url).searchParams.get("filename");
  if (!filename || path.basename(filename) !== filename) {
    return imageError("Nama file gambar tidak valid.", 400);
  }

  const contentType = imageContentTypes[path.extname(filename).toLowerCase()];
  if (!contentType) {
    return imageError("Format gambar tidak didukung.", 415);
  }

  const uploadDirectories = new Set([
    getPortfolioUploadDirectory(),
    getLegacyPortfolioUploadDirectory(),
  ]);
  let image: Buffer | undefined;

  for (const uploadDirectory of uploadDirectories) {
    const filePath = path.resolve(uploadDirectory, filename);
    if (path.dirname(filePath) !== uploadDirectory) {
      return imageError("Nama file gambar tidak valid.", 400);
    }

    try {
      image = await readFile(filePath);
      break;
    } catch (error) {
      if (!isMissingFileError(error)) throw error;
    }
  }

  if (!image) {
    return imageError("Gambar portfolio tidak ditemukan.", 404);
  }

  return new NextResponse(new Uint8Array(image), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
