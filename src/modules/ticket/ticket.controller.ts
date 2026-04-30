import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../class/appError.js";
import {
  checkInTicketService,
  getTicketAttendanceStatsService,
  getTicketsService,
} from "./ticket.service.js";
import type {
  TCheckInTicketBody,
  TGetTicketAttendanceStatsQuery,
  TGetTicketsQuery,
} from "./ticket.schemas.js";

export const getTicketsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const query = (req.validated?.query ?? {}) as TGetTicketsQuery;
    const result = await getTicketsService(actor.id, actor.role, query);

    res.status(200).json({
      message: "Tickets fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getTicketAttendanceStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const query = (req.validated?.query ?? {}) as TGetTicketAttendanceStatsQuery;
    const data = await getTicketAttendanceStatsService(
      actor.id,
      actor.role,
      query,
    );

    res.status(200).json({
      message: "Ticket attendance stats fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const checkInTicketController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const payload = req.validated?.body as TCheckInTicketBody;
    const data = await checkInTicketService(actor.id, actor.role, payload);

    res.status(200).json({
      message: "Ticket checked in successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
