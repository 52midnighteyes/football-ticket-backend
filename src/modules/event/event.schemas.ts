import * as zod from "zod";
import { EventStatus } from "../../../generated/prisma/enums.js";

const parseJsonField = (value: unknown) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const eventPayloadSchema = zod
  .object({
    categoryId: zod.uuid("Category ID must be a valid UUID"),
    cityId: zod.uuid("City ID must be a valid UUID"),
    name: zod
      .string("Name must be a valid string")
      .nonempty("Name is required")
      .trim(),
    description: zod
      .string("Description must be a valid string")
      .nonempty("Description is required")
      .trim(),
    venue: zod
      .string("Venue must be a valid string")
      .nonempty("Venue is required")
      .trim(),
    address: zod
      .string("Address must be a valid string")
      .nonempty("Address is required")
      .trim(),
    startAt: zod.coerce.date(),
    endAt: zod.coerce.date(),
    status: zod.enum(EventStatus).default("DRAFT"),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "End date must be after start date",
    path: ["endAt"],
  });

const ticketTypeBaseSchema = zod.object({
  name: zod
    .string("Ticket type name must be a valid string")
    .nonempty("Ticket type name is required")
    .trim(),
  price: zod.coerce
    .number("Ticket type price must be a valid number")
    .int("Ticket type price must be an integer")
    .min(0, "Ticket type price must be at least 0"),
  quota: zod.coerce
    .number("Ticket type quota must be a valid number")
    .int("Ticket type quota must be an integer")
    .min(1, "Ticket type quota must be at least 1"),
  isActive: zod.boolean().optional().default(true),
});

const createTicketTypesSchema = zod.preprocess(
  parseJsonField,
  zod
    .array(ticketTypeBaseSchema)
    .min(1, "At least one ticket type is required"),
);

const updateTicketTypesSchema = zod.preprocess(
  parseJsonField,
  zod
    .array(
      ticketTypeBaseSchema.extend({
        id: zod.uuid("Ticket type ID must be a valid UUID").optional(),
      }),
    )
    .min(1, "At least one ticket type is required"),
);

export const organizerEventParamsSchema = zod.object({
  id: zod.uuid("Organizer ID must be a valid UUID"),
});

export const eventIdParamsSchema = zod.object({
  id: zod.uuid("Event ID must be a valid UUID"),
});

export const eventSlugParamsSchema = zod.object({
  slug: zod.string().trim().min(1, "Event slug is required"),
});

export const getEventsQuerySchema = zod.object({
  id: zod.uuid("Event ID must be a valid UUID").optional(),
  slug: zod.string().trim().min(1, "Event slug is required").optional(),
  organizerId: zod.uuid("Organizer ID must be a valid UUID").optional(),
  locationId: zod.uuid("Location ID must be a valid UUID").optional(),
  categoryId: zod.uuid("Category ID must be a valid UUID").optional(),
  status: zod.enum(EventStatus).optional(),
  page: zod.coerce.number().int().min(1).default(1),
  limit: zod.coerce.number().int().min(1).max(100).default(10),
});

export const createEventBodySchema = eventPayloadSchema.extend({
  ticketTypes: createTicketTypesSchema,
});
export const updateEventBodySchema = eventPayloadSchema.extend({
  ticketTypes: updateTicketTypesSchema,
});
export const createTicketTypesBodySchema = zod.object({
  ticketTypes: createTicketTypesSchema,
});

export type TOrganizerEventParams = zod.infer<
  typeof organizerEventParamsSchema
>;
export type TEventIdParams = zod.infer<typeof eventIdParamsSchema>;
export type TEventSlugParams = zod.infer<typeof eventSlugParamsSchema>;
export type TGetEventsQuery = zod.infer<typeof getEventsQuerySchema>;
export type TCreateEventBody = zod.infer<typeof createEventBodySchema>;
export type TUpdateEventBody = zod.infer<typeof updateEventBodySchema>;
export type TCreateTicketTypesBody = zod.infer<
  typeof createTicketTypesBodySchema
>;
