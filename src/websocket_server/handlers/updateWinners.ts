import { getWinners } from '../db';
import { ISocket } from '../models';
import { Event } from '../enums';

export const updateWinners = (sockets: ISocket[]) => {
  sockets.forEach(({ socket }) => (
    socket.send(JSON.stringify({
      type: Event.UPDATE_WINNERS,
      data: JSON.stringify(getWinners()),
      id: 0
    }))
  ))
};
