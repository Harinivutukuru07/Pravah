import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        const errors = issues.map((e: any) => ({
          field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
          message: e.message,
        }));

        res.status(422).json({
          success: false,
          message: 'Validation failed.',
          errors,
        });
        return;
      }

      next(error);
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues || (error as any).errors || [];
        res.status(400).json({
          success: false,
          message: 'Invalid parameters.',
          errors: issues.map((e: any) => ({
            field: Array.isArray(e.path) ? e.path.join('.') : String(e.path),
            message: e.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
