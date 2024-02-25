import { ISocket, IUser } from '../models';
import {
  addSecondUserToRoom,
  checkIsUserAlreadyInRoom,
  createNewGame,
  getGameLength,
  getOpponentsWs,
  getUsersByRoomId,
} from '../db';
import { updateRoom } from './updateRoom';
import { EventType } from '../enums';

interface IAddUserToRoomProps {
  currentUser: IUser;
  id: number;
  indexRoom: number;
  sockets: ISocket[];
}

export const addUserToRoom = ({
  indexRoom,
  currentUser,
  id,
  sockets,
}: IAddUserToRoomProps) => {
  const isUserAlreadyInRoom = checkIsUserAlreadyInRoom({
    roomId: indexRoom,
    userIndex: currentUser.index,
  });

  if (!isUserAlreadyInRoom) {
    addSecondUserToRoom(indexRoom, currentUser);
    updateRoom(sockets);
    const idGame = getGameLength();

    const usersIndexesInRoom = getUsersByRoomId(indexRoom);
    const opponentsWs = getOpponentsWs(usersIndexesInRoom);

    opponentsWs.forEach((socket, index) => {
      const newGame = {
        idGame,
        idPlayer: usersIndexesInRoom[index],
      };
      const resCreateGameData = JSON.stringify({
        type: EventType.CREATE_GAME,
        id,
        data: JSON.stringify(newGame),
      });

      socket.send(resCreateGameData);
    });

    createNewGame({ idGame });
  }
};
