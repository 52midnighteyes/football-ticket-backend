import { rateLimit } from "express-rate-limit";

export const blogReadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many read requests. Please try again later.",
  },
});

export const blogDetailLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many detail requests. Please try again later.",
  },
});

export const blogWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many write requests. Please try again later.",
  },
});

export const blogUploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many upload requests. Please try again later.",
  },
});
