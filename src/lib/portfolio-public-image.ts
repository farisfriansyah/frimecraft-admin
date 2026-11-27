import { withAdminBasePath } from "@/src/lib/app-config";
import { getPortfolioImageSrc } from "@/src/lib/portfolio-image";

export function getPublicPortfolioImageUrl(imageUrl: string | null, requestUrl: string) {
  const imageSrc = getPortfolioImageSrc(imageUrl);
  if (!imageUrl || !imageSrc || imageSrc === imageUrl) return imageUrl;

  return new URL(withAdminBasePath(imageSrc), requestUrl).toString();
}
