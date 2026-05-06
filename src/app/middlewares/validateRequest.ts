import { NextFunction, Request, Response } from "express";
import { ZodObject, ZodRawShape } from "zod";

export const validateRequest = (schema: ZodObject<ZodRawShape>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, params: req.params, query: req.query });
      next();
    } catch (error: any) {
      res
        .status(400)
        .json({
          success: false,
          message: "Validation failed",
          errors: error.errors,
        });
    }
  };
};
