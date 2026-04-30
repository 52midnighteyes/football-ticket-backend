import * as zod from "zod";

const sortOrderSchema = zod.enum(["asc", "desc"]);
const ticketSortBySchema = zod.enum([
  "code",
  "checkedInAt",
  "createdAt",
]);

const checkedInBooleanSchema = zod.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();

  if (normalized === "true") return true;
  if (normalized === "false") return false;

  return value;
}, zod.boolean().optional());

export const checkInTicketBodySchema = zod.object({
  code: zod.string().trim().min(1, "Ticket code is required"),
});

export const getTicketsQuerySchema = zod.object({
  id: zod.uuid("Ticket ID must be a valid UUID").optional(),
  organizerId: zod.uuid("Organizer ID must be a valid UUID").optional(),
  transactionId: zod.uuid("Transaction ID must be a valid UUID").optional(),
  transactionItemId: zod
    .uuid("Transaction item ID must be a valid UUID")
    .optional(),
  eventId: zod.uuid("Event ID must be a valid UUID").optional(),
  userId: zod.uuid("User ID must be a valid UUID").optional(),
  code: zod.string().trim().min(1, "Ticket code is required").optional(),
  codeLike: zod
    .string()
    .trim()
    .min(1, "Ticket codeLike is required")
    .optional(),
  eventNameLike: zod
    .string()
    .trim()
    .min(1, "Event nameLike is required")
    .optional(),
  ticketTypeNameLike: zod
    .string()
    .trim()
    .min(1, "Ticket type nameLike is required")
    .optional(),
  checkedIn: checkedInBooleanSchema,
  sortBy: ticketSortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
  page: zod.coerce.number().int().min(1).default(1),
  limit: zod.coerce.number().int().min(1).max(100).default(10),
});

export const getTicketAttendanceStatsQuerySchema = zod.object({
  eventId: zod.uuid("Event ID must be a valid UUID"),
});

export type TCheckInTicketBody = zod.infer<typeof checkInTicketBodySchema>;
export type TGetTicketsQuery = zod.infer<typeof getTicketsQuerySchema>;
export type TGetTicketAttendanceStatsQuery = zod.infer<
  typeof getTicketAttendanceStatsQuerySchema
>;
