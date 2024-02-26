import { getRoomsWithOneUser } from '../db';
import { EventType } from '../enums';
import { ISocket } from '../models';

export const updateRoom = (sockets: ISocket[]) => {
  sockets.forEach(({ ws }) =>
    ws.send(
      JSON.stringify({
        type: EventType.UPDATE_ROOM,
        data: JSON.stringify(getRoomsWithOneUser()),
        id: 0,
      })
    )
  );
};
