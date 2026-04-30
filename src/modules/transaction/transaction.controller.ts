import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../class/appError.js";
import type {
  TCheckVoucherQuery,
  TCreateTransactionBody,
  TGetOrganizerRevenueQuery,
  TGetOrganizerTransactionsQuery,
  TGetMyTransactionsQuery,
  TTransactionIdParams,
  TUpdateTransactionStatusBody,
} from "./transaction.schemas.js";
import {
  checkVoucherService,
  createTransactionService,
  getMyAvailablePointsService,
  getMyCouponsService,
  getOrganizerRevenueAnalyticsService,
  getOrganizerTransactionsService,
  getMyTransactionsService,
  reviewTransactionService,
  uploadTransactionPaymentProofService,
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

export const uploadTransactionPaymentProofController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    const file = req.file;

    if (!actor) throw new AppError(401, "Unauthorized");
    if (!file) throw new AppError(400, "No file uploaded");

    const { id } = req.validated?.params as TTransactionIdParams;
    const data = await uploadTransactionPaymentProofService(actor.id, id, file);

    res.status(200).json({
      message: "Payment proof uploaded successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewTransactionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const { id } = req.validated?.params as TTransactionIdParams;
    const payload = req.validated?.body as TUpdateTransactionStatusBody;

    const data = await reviewTransactionService(
      actor.id,
      actor.role,
      id,
      payload,
    );

    res.status(200).json({
      message: "Transaction status updated successfully",
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

export const getOrganizerTransactionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const query = (req.validated?.query ?? {}) as TGetOrganizerTransactionsQuery;
    const result = await getOrganizerTransactionsService(
      actor.id,
      actor.role,
      query,
    );

    res.status(200).json({
      message: "Organizer transactions fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerRevenueAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const actor = req.user;
    if (!actor) throw new AppError(401, "Unauthorized");

    const query = (req.validated?.query ?? {}) as TGetOrganizerRevenueQuery;
    const data = await getOrganizerRevenueAnalyticsService(
      actor.id,
      actor.role,
      query,
    );

    res.status(200).json({
      message: "Revenue analytics fetched successfully",
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
