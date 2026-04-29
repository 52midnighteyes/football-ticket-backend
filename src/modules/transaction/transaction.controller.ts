import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../class/appError.js";
import type {
  TCheckVoucherQuery,
  TCreateTransactionBody,
  TGetMyTransactionsQuery,
} from "./transaction.schemas.js";
import {
  checkVoucherService,
  createTransactionService,
  getMyAvailablePointsService,
  getMyCouponsService,
  getMyTransactionsService,
} from "./transaction.service.js";

export const createTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const payload = req.validated?.body as TCreateTransactionBody;
    const data = await createTransactionService(actor.id, payload);

    res.status(201).json({
      message: "Transaction created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const query = (req.validated?.query ?? {}) as TGetMyTransactionsQuery;
    const data = await getMyTransactionsService(actor.id, query);

    res.status(200).json({
      message: "Transactions fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const checkVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = req.validated?.query as TCheckVoucherQuery;
    const data = await checkVoucherService(query);

    res.status(200).json({
      message: "Voucher is valid",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyCouponsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const data = await getMyCouponsService(actor.id);

    res.status(200).json({
      message: "Coupons fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAvailablePointsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const data = await getMyAvailablePointsService(actor.id);

    res.status(200).json({
      message: "Available points fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
