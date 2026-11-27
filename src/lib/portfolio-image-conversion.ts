import sharp from "sharp";

const supportedImageFormats = new Set(["avif", "jpeg", "png", "webp"]);

export async function convertPortfolioImageToWebp(image: Buffer) {
  const source = sharp(image, { limitInputPixels: 40_000_000 });
  const metadata = await source.metadata();

  if (!metadata.format || !supportedImageFormats.has(metadata.format)) {
    throw new Error("Format gambar tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.");
  }

  return source
    .rotate()
    .resize({
      width: 1920,
      height: 1440,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}
