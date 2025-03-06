import { User } from "./schemas/user.schema";
import { Request } from 'express';
export interface IRequest extends Request {
  user: any;
}
