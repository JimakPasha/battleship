import { WebSocket } from 'ws';
import { getRoomsWithOneUser } from '../db';
import { EventType } from '../enums';

export const updateRoom = (sockets: WebSocket[]) => {
  sockets.forEach((socket) =>
    socket.send(
      JSON.stringify({
        type: EventType.UPDATE_ROOM,
        data: JSON.stringify(getRoomsWithOneUser()),
        id: 0,
      })
    )
  );
};
