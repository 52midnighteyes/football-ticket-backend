import { AppError } from "../../class/appError.js";
import { createSlug } from "../../helper/stringGenerator.js";
import {
  deleteFromCloudinary,
  getPublicIdFromCloudinaryUrl,
  uploadToCloudinary,
} from "../../libs/cloudinary/cloudinary.lib.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import {
  countEvents,
  createEvent,
  createTicketType,
  deleteEvent,
  findEventById,
  findManyEvents,
  updateEvent,
} from "./event.repository.js";
import type {
  TCreateEventBody,
  TGetEventsQuery,
  TCreateTicketTypeBody,
  TUpdateEventBody,
} from "./event.schemas.js";

const deleteBannerByUrl = async (bannerUrl: string) => {
  const publicId = getPublicIdFromCloudinaryUrl(bannerUrl);
  if (!publicId) return;

  try {
    await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error("Failed to delete event banner from Cloudinary", error);
  }
};

export const createEventService = async (
  actorId: string,
  actorRole: UserRole,
  organizerId: string,
  payload: TCreateEventBody,
  file?: Express.Multer.File,
) => {
  let isUploaded = false;
  let publicId = "";

  try {
    if (!file) throw new AppError(400, "Banner image is required");
    if (actorId !== organizerId && actorRole !== UserRole.ADMIN) {
      throw new AppError(403, "You are not allowed to create this event");
    }

    const slug = createSlug(payload.name);
    const { public_id, secure_url } = await uploadToCloudinary(
      file,
      organizerId,
      "EVENT_BANNER",
    );

    isUploaded = true;
    publicId = public_id;

    return await createEvent({
      ...payload,
      organizerId,
      slug,
      bannerUrl: secure_url,
    });
  } catch (error) {
    if (isUploaded) await deleteFromCloudinary(publicId);
    throw error;
  }
};

export const getEventsService = async (query: TGetEventsQuery) => {
  const where: Prisma.EventWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(query.slug ? { slug: query.slug } : {}),
    ...(query.organizerId ? { organizerId: query.organizerId } : {}),
    ...(query.locationId ? { cityId: query.locationId } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    findManyEvents(where, { skip, take: limit }),
    countEvents(where),
  ]);

  if ((query.id || query.slug) && events.length === 0) {
    throw new AppError(404, "Event not found");
  }

  return {
    data: events,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateEventService = async (
  actorId: string,
  actorRole: UserRole,
  id: string,
  payload: TUpdateEventBody,
  file?: Express.Multer.File,
) => {
  let isUploaded = false;
  let newPublicId = "";

  try {
    const existingEvent = await findEventById(id);
    if (!existingEvent) throw new AppError(404, "Event not found");
    if (existingEvent.organizerId !== actorId && actorRole !== UserRole.ADMIN) {
      throw new AppError(403, "You are not allowed to update this event");
    }

    let nextBannerUrl = existingEvent.bannerUrl;
    if (file) {
      const { public_id, secure_url } = await uploadToCloudinary(
        file,
        existingEvent.organizerId,
        "EVENT_BANNER",
      );

      isUploaded = true;
      newPublicId = public_id;
      nextBannerUrl = secure_url;
    }

    const updatedEvent = await updateEvent(id, {
      ...payload,
      slug: createSlug(payload.name),
      bannerUrl: nextBannerUrl,
    });

    if (file && existingEvent.bannerUrl !== nextBannerUrl) {
      await deleteBannerByUrl(existingEvent.bannerUrl);
    }

    return updatedEvent;
  } catch (error) {
    if (isUploaded) await deleteFromCloudinary(newPublicId);
    throw error;
  }
};

export const deleteOwnedEventService = async (
  actorId: string,
  actorRole: UserRole,
  id: string,
) => {
  const existingEvent = await findEventById(id);
  if (!existingEvent) throw new AppError(404, "Event not found");
  if (existingEvent.organizerId !== actorId && actorRole !== UserRole.ADMIN) {
    throw new AppError(403, "You are not allowed to delete this event");
  }

  const deletedEvent = await deleteEvent(id);
  await deleteBannerByUrl(existingEvent.bannerUrl);

  return deletedEvent;
};

export const createTicketTypeService = async (
  actorId: string,
  actorRole: UserRole,
  eventId: string,
  payload: TCreateTicketTypeBody,
) => {
  const event = await findEventById(eventId);
  if (!event) throw new AppError(404, "Event not found");
  if (event.organizerId !== actorId && actorRole !== UserRole.ADMIN) {
    throw new AppError(
      403,
      "You are not allowed to create ticket type for this event",
    );
  }

  return createTicketType({
    ...payload,
    eventId,
  });
};
