import { WebSocket } from 'ws';
import { ISocket, IUser } from '../models';
import { createNewUser } from '../db';
import { updateRoom } from './updateRoom';
import { updateWinners } from './updateWinners';

interface IRegestrationUserProps {
  type: string;
  id: number;
  newUser: IUser;
  ws: WebSocket;
  sockets: ISocket[];
}

export const regestrationUser = ({
  id,
  newUser,
  type,
  ws,
  sockets,
}: IRegestrationUserProps) => {
  const resRegData = JSON.stringify({
    type,
    id,
    data: JSON.stringify({
      ...newUser,
      error: false,
      errorText: '',
    }),
  });
  ws.send(resRegData);

  createNewUser({ ...newUser, ws });
  updateRoom(sockets);
  updateWinners(sockets);
};
