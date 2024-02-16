import { getWinners } from '../db';
import { ISocket } from '../models';
import { EventType } from '../enums';

export const updateWinners = (sockets: ISocket[]) => {
  sockets.forEach(({ socket }) => (
    socket.send(JSON.stringify({
      type: EventType.UPDATE_WINNERS,
      data: JSON.stringify(getWinners()),
      id: 0
    }))
  ))
};
