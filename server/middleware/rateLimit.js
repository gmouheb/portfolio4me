export function createRateLimiter({ windowMs, max, keyPrefix }) {
  const hits = new Map();

  return function rateLimit(req, res, next) {
    const now = Date.now();
    const identifier = `${keyPrefix}:${req.ip || "unknown"}`;
    const current = hits.get(identifier);

    if (!current || now > current.resetAt) {
      hits.set(identifier, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    current.count += 1;
    return next();
  };
}
