import { WebSocket } from 'ws';

export interface IUser {
  name: string;
  index: number;
}

export interface IUserWithWS extends IUser {
  ws: WebSocket;
}
