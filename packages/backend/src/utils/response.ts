import type { Response } from 'express';

export function success<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json(data);
}

export function created<T>(res: Response, data: T): Response {
  return res.status(201).json(data);
}

export function noContent(res: Response): Response {
  return res.status(204).send();
}
