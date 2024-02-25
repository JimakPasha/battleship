import { IShip, IUser } from '../models';
import {
  addShipsForGame,
  getGameTurnByGameId,
  getOpponentsWs,
  getShipsUserInGame,
  getUsersByGameId,
  isAllUsersInGameAddShips,
} from '../db';
import { EventType } from '../enums';

interface IAddShipsProps {
  id: number;
  currentUser: IUser;
  parsedData: {
    gameId: number;
    indexPlayer: number;
    ships: IShip[];
  };
}

export const addShips = ({ parsedData, id, currentUser }: IAddShipsProps) => {
  const { gameId, indexPlayer, ships } = parsedData;
  addShipsForGame({ gameId, indexPlayer, ships });

  if (isAllUsersInGameAddShips(gameId)) {
    const usersIndexesInGame = getUsersByGameId(parsedData.gameId);
    const opponentsWs = getOpponentsWs(usersIndexesInGame);

    opponentsWs.forEach((socket, index) => {
      const resGameData = JSON.stringify({
        type: EventType.START_GAME,
        id,
        data: JSON.stringify({
          ships: getShipsUserInGame({
            idGame: gameId,
            indexPlayer: usersIndexesInGame[index],
          }),
          currentPlayerIndex: currentUser.index,
        }),
      });

      socket.send(resGameData);
    });

    const turnGameData = JSON.stringify({
      type: EventType.TURN,
      id,
      data: JSON.stringify({
        currentPlayer: getGameTurnByGameId(gameId),
      }),
    });

    opponentsWs.forEach((socket) => {
      socket.send(turnGameData);
    });
  }
};
