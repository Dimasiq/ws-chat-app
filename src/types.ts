import { Request } from 'express';
import { Socket } from 'socket.io';

export interface IAuthBody {
  username: string;
  password: string;
}

export interface IUserRes {
  userId: string;
  username: string;
  access_token: string;
  refresh_token: string;
}

export interface ISocketConnection extends Socket {
  sessionId?: string;
  userId: string;
  username: string;
}

export interface IAuthorizedRequest extends Request {
  user: string;
}
