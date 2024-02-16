import { getRoomsWithOneUser } from '../db';
import { ISocket } from '../models';
import { Event } from '../enums';

export const updateRoom = (sockets: ISocket[]) => {
  sockets.forEach(({ socket }) => (
    socket.send(JSON.stringify({
      type: Event.UPDATE_ROOM,
      data: JSON.stringify(getRoomsWithOneUser()),
      id: 0
    }))
  ))
};
