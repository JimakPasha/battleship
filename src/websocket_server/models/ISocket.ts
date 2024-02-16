import { WebSocket } from 'ws';

export interface ISocket {
  id: number;
  socket: WebSocket;
  currentPlayer?: number;
}