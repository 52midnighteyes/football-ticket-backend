import { AppError } from "../../class/appError.js";
import { createSlug } from "../../helper/stringGenerator.js";
import {
  deleteFromCloudinary,
  getPublicIdFromCloudinaryUrl,
  uploadToCloudinary,
} from "../../libs/cloudinary/cloudinary.lib.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import {
  countEvents,
  createEvent,
  createTicketType,
  deleteEvent,
  findEventById,
  findEventBySlug,
  findManyEvents,
  updateEvent,
  updateTicketType,
} from "./event.repository.js";
import type {
  TCreateEventBody,
  TGetEventsQuery,
  TUpdateEventBody,
} from "./event.schemas.js";

const buildStringFilter = (exact?: string, like?: string) => {
  if (!exact && !like) return undefined;

  return {
    ...(exact
      ? {
          equals: exact,
        }
      : {}),
    ...(like
      ? {
          contains: like,
        }
      : {}),
    mode: "insensitive" as const,
  };
};

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

    const { ticketTypes, ...eventPayload } = payload;
    const slug = createSlug(payload.name);
    const { public_id, secure_url } = await uploadToCloudinary(
      file,
      organizerId,
      "EVENT_BANNER",
    );

    isUploaded = true;
    publicId = public_id;

    return await createEvent({
      organizer: {
        connect: {
          id: organizerId,
        },
      },
      category: {
        connect: {
          id: eventPayload.categoryId,
        },
      },
      city: {
        connect: {
          id: eventPayload.cityId,
        },
      },
      name: eventPayload.name,
      slug,
      description: eventPayload.description,
      bannerUrl: secure_url,
      venue: eventPayload.venue,
      address: eventPayload.address,
      startAt: eventPayload.startAt,
      endAt: eventPayload.endAt,
      status: eventPayload.status,
      ticketTypes: {
        create: ticketTypes.map((ticketType) => ({
          name: ticketType.name,
          price: ticketType.price,
          quota: ticketType.quota,
          isActive: ticketType.isActive,
        })),
      },
    });
  } catch (error) {
    if (isUploaded) await deleteFromCloudinary(publicId);
    throw error;
  }
};

export const getEventsService = async (query: TGetEventsQuery) => {
  const slugFilter = buildStringFilter(query.slug, query.slugLike);
  const nameFilter = buildStringFilter(undefined, query.nameLike);
  const descriptionFilter = buildStringFilter(undefined, query.descriptionLike);
  const venueFilter = buildStringFilter(undefined, query.venueLike);
  const addressFilter = buildStringFilter(undefined, query.addressLike);
  const sortBy = query.sortBy ?? "createdAt";
  const sortOrder = query.sortOrder ?? "desc";

  const where: Prisma.EventWhereInput = {
    ...(query.id ? { id: query.id } : {}),
    ...(slugFilter ? { slug: slugFilter } : {}),
    ...(nameFilter ? { name: nameFilter } : {}),
    ...(descriptionFilter ? { description: descriptionFilter } : {}),
    ...(venueFilter ? { venue: venueFilter } : {}),
    ...(addressFilter ? { address: addressFilter } : {}),
    ...(query.organizerId ? { organizerId: query.organizerId } : {}),
    ...(query.locationId ? { cityId: query.locationId } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    findManyEvents(where, {
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    }),
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

export const getEventByIdService = async (id: string) => {
  const event = await findEventById(id);
  if (!event) throw new AppError(404, "Event not found");

  return event;
};

export const getEventBySlugService = async (slug: string) => {
  const event = await findEventBySlug(slug);
  if (!event) throw new AppError(404, "Event not found");

  return event;
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

    const { ticketTypes, ...eventPayload } = payload;
    const nextSlug =
      !eventPayload.name || eventPayload.name === existingEvent.name
        ? existingEvent.slug
        : createSlug(eventPayload.name);
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

    await prisma.$transaction(async (tx) => {
      await updateEvent(
        id,
        {
          category: {
            connect: {
              id: eventPayload.categoryId,
            },
          },
          city: {
            connect: {
              id: eventPayload.cityId,
            },
          },
          name: eventPayload.name,
          slug: nextSlug,
          description: eventPayload.description,
          bannerUrl: nextBannerUrl,
          venue: eventPayload.venue,
          address: eventPayload.address,
          startAt: eventPayload.startAt,
          endAt: eventPayload.endAt,
          status: eventPayload.status,
        },
        tx,
      );

      const existingTicketTypes = new Map(
        existingEvent.ticketTypes.map((ticketType) => [ticketType.id, ticketType]),
      );

      for (const ticketType of ticketTypes) {
        if (ticketType.id) {
          const existingTicketType = existingTicketTypes.get(ticketType.id);
          if (!existingTicketType) {
            throw new AppError(404, "Ticket type not found");
          }

          await updateTicketType(
            ticketType.id,
            {
              name: ticketType.name,
              price: ticketType.price,
              quota: ticketType.quota,
              isActive: ticketType.isActive,
            },
            tx,
          );

          continue;
        }

        await createTicketType(
          {
            eventId: id,
            name: ticketType.name,
            price: ticketType.price,
            quota: ticketType.quota,
            isActive: ticketType.isActive,
          },
          tx,
        );
      }
    });

    if (file && existingEvent.bannerUrl !== nextBannerUrl) {
      await deleteBannerByUrl(existingEvent.bannerUrl);
    }

    const updatedEvent = await findEventById(id);
    if (!updatedEvent) throw new AppError(404, "Event not found");

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

export const createTicketTypesService = async (
  actorId: string,
  actorRole: UserRole,
  eventId: string,
  payload: Array<{
    name: string;
    price: number;
    quota: number;
    isActive: boolean;
  }>,
) => {
  const event = await findEventById(eventId);
  if (!event) throw new AppError(404, "Event not found");
  if (event.organizerId !== actorId && actorRole !== UserRole.ADMIN) {
    throw new AppError(
      403,
      "You are not allowed to create ticket type for this event",
    );
  }

  return prisma.$transaction(async (tx) => {
    const ticketTypes = [];

    for (const ticketType of payload) {
      ticketTypes.push(
        await createTicketType(
          {
            ...ticketType,
            eventId,
          },
          tx,
        ),
      );
    }

    return ticketTypes;
  });
};
