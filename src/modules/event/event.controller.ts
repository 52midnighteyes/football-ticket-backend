import { NextFunction, Request, Response } from "express";
import { AppError } from "../../class/appError.js";
import {
  TCreateEventBody,
  TCreateTicketTypeBody,
  TEventIdParams,
  TGetEventsQuery,
  TOrganizerEventParams,
  TUpdateEventBody,
} from "./event.schemas.js";
import {
  createEventService,
  createTicketTypeService,
  deleteOwnedEventService,
  getEventsService,
  updateEventService,
} from "./event.service.js";

export const createEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TOrganizerEventParams;
    const payload = req.validated?.body as TCreateEventBody;
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");
    const data = await createEventService(
      actor.id,
      actor.role,
      id,
      payload,
      req.file,
    );

    res.status(201).json({
      message: "Event created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = (req.validated?.query ?? {}) as TGetEventsQuery;
    const result = await getEventsService(query);
    res.status(200).json({
      message: "Events fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TEventIdParams;
    const payload = req.validated?.body as TUpdateEventBody;
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");
    const data = await updateEventService(
      actor.id,
      actor.role,
      id,
      payload,
      req.file,
    );
    res.status(200).json({
      message: "Event updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEventController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TEventIdParams;
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");
    const data = await deleteOwnedEventService(actor.id, actor.role, id);
    res.status(200).json({
      message: "Event deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createTicketTypeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TEventIdParams;
    const payload = req.validated?.body as TCreateTicketTypeBody;
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const data = await createTicketTypeService(
      actor.id,
      actor.role,
      id,
      payload,
    );

    res.status(201).json({
      message: "Ticket type created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
