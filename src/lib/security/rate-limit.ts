type RateLimitConfig = {
  windowMs: number;
  max: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
  source: "memory" | "upstash";
};

const globalForRateLimit = globalThis as unknown as {
  __rateLimitStore?: Map<string, RateLimitBucket>;
};

const rateLimitStore = globalForRateLimit.__rateLimitStore ?? new Map<string, RateLimitBucket>();
if (!globalForRateLimit.__rateLimitStore) {
  globalForRateLimit.__rateLimitStore = rateLimitStore;
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function hasUpstashConfig() {
  return Boolean(upstashUrl && upstashToken);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

function checkRateLimitMemory(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now >= existing.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      allowed: true,
      remaining: Math.max(config.max - 1, 0),
      retryAfterMs: 0,
      source: "memory",
    };
  }

  existing.count += 1;
  const remaining = Math.max(config.max - existing.count, 0);
  const allowed = existing.count <= config.max;

  return {
    allowed,
    remaining,
    retryAfterMs: allowed ? 0 : Math.max(existing.resetAt - now, 0),
    source: "memory",
  };
}

async function checkRateLimitUpstash(key: string, config: RateLimitConfig): Promise<RateLimitResult | null> {
  if (!hasUpstashConfig()) return null;

  try {
    const commands: Array<[string, ...Array<string | number>]> = [
      ["INCR", key],
      ["PTTL", key],
    ];

    const response = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commands),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as Array<{ result?: number | string | null }>;
    const count = Number(payload?.[0]?.result ?? 0);
    let pttl = Number(payload?.[1]?.result ?? -1);

    if (!count || Number.isNaN(count)) return null;

    if (count === 1) {
      const expireResponse = await fetch(`${upstashUrl}/pexpire/${encodeURIComponent(key)}/${config.windowMs}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
        },
        cache: "no-store",
      });

      if (!expireResponse.ok) return null;
      pttl = config.windowMs;
    }

    const normalizedTtl = pttl < 0 || Number.isNaN(pttl) ? config.windowMs : pttl;
    const allowed = count <= config.max;

    return {
      allowed,
      remaining: Math.max(config.max - count, 0),
      retryAfterMs: allowed ? 0 : normalizedTtl,
      source: "upstash",
    };
  } catch {
    return null;
  }
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const upstashResult = await checkRateLimitUpstash(key, config);
  if (upstashResult) return upstashResult;

  return checkRateLimitMemory(key, config);
}
