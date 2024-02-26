import { WebSocket } from 'ws';

export interface ISocket {
  ws: WebSocket;
  userIndex: number;
}
