import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/httpError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("💥 ERROR:", error);

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(500).json({ error: "Error interno del servidor" });
}
