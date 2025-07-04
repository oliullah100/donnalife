import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCoed = httpStatus.INTERNAL_SERVER_ERROR;
  let success = false;
  let message = error?.message || "Something went wrong";
  let err = error;

  if (error instanceof Prisma.PrismaClientValidationError) {
    message = "Validation Error";
    err = error.message;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      message = "Dupliacte key error";
      err = error.meta;
    }
  }

  res.status(statusCoed).json({
    success: success,
    message: message,
    error: err,
  });
};

export default globalErrorHandler;
