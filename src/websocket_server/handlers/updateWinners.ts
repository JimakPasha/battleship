import { getWinners } from '../db';
import { EventType } from '../enums';
import { ISocket } from '../models';

export const updateWinners = (sockets: ISocket[]) => {
  sockets.forEach(({ ws }) =>
    ws.send(
      JSON.stringify({
        type: EventType.UPDATE_WINNERS,
        data: JSON.stringify(getWinners()),
        id: 0,
      })
    )
  );
};
