import { getRoomsWithOneUser } from '../db';
import { ISocket } from '../models';
import { EventType } from '../enums';

export const updateRoom = (sockets: ISocket[]) => {
  sockets.forEach(({ socket }) => (
    socket.send(JSON.stringify({
      type: EventType.UPDATE_ROOM,
      data: JSON.stringify(getRoomsWithOneUser()),
      id: 0
    }))
  ))
};
