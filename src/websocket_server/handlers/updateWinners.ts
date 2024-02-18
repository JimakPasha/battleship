import { WebSocket } from 'ws';
import { getWinners } from '../db';
import { EventType } from '../enums';

export const updateWinners = (sockets: WebSocket[]) => {
  sockets.forEach((socket) =>
    socket.send(
      JSON.stringify({
        type: EventType.UPDATE_WINNERS,
        data: JSON.stringify(getWinners()),
        id: 0,
      })
    )
  );
};
