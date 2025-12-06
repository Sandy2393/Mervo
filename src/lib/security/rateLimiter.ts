/**
 * Simple token-bucket rate limiter middleware example for Express.
 * Configure via environment variables. In production use managed rate limiting (API gateway, Cloud Run, etc.)
 */

// Keep types minimal to avoid adding server-only dev dependencies here
type Request = any;
type Response = any;
type NextFunction = any;

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

const RATE_LIMIT_TOKENS = Number(process.env.RATE_LIMIT_TOKENS || '60'); // tokens per window
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // window duration in ms

function refill(bucket: Bucket) {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  if (elapsed <= 0) return;
  const refillRatio = elapsed / RATE_LIMIT_WINDOW_MS;
  const refillTokens = Math.floor(refillRatio * RATE_LIMIT_TOKENS);
  if (refillTokens > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_TOKENS, bucket.tokens + refillTokens);
    bucket.lastRefill = now;
  }
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const key = req.ip || req.header('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  if (!buckets.has(key)) buckets.set(key, { tokens: RATE_LIMIT_TOKENS, lastRefill: now });

  const bucket = buckets.get(key)!;
  refill(bucket);

  if (bucket.tokens <= 0) {
    res.status(429).json({ error: 'Rate limit exceeded' });
    return;
  }

  bucket.tokens -= 1;
  next();
}

export default rateLimiter;