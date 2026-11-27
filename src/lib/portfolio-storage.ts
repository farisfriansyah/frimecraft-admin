import os from "node:os";
import path from "node:path";

export function getPortfolioUploadDirectory() {
  const configuredDirectory = process.env.PORTFOLIO_UPLOAD_DIR;
  const uploadDirectory = configuredDirectory || path.join(os.homedir(), ".frimecraft", "uploads", "portfolio");
  return path.resolve(uploadDirectory);
}

export function getLegacyPortfolioUploadDirectory() {
  return path.resolve(process.cwd(), "public", "uploads", "portfolio");
}
