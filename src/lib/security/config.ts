const DEV_SESSION_SECRET = "dev-secret-key-yang-sangat-panjang-dan-unik";

function hasMinLength(value: string, minLength: number) {
  return value.trim().length >= minLength;
}

export function getSessionSecretKey(): string {
  const envSecret = process.env.SESSION_SECRET;
  const isProduction = process.env.NODE_ENV === "production";

  if (envSecret && hasMinLength(envSecret, 32)) {
    return envSecret;
  }

  if (isProduction) {
    throw new Error("FATAL: SESSION_SECRET wajib diisi dan minimal 32 karakter di production.");
  }

  return envSecret && envSecret.length > 0 ? envSecret : DEV_SESSION_SECRET;
}

export function getSessionSecretBytes() {
  return new TextEncoder().encode(getSessionSecretKey());
}
