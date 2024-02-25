import {
  attack,
  checkIsFinishGame,
  getIndexEnemyByGameIdByUserId,
  getNameByIndexUser,
  getOpponentsWs,
  getUsersByGameId,
  setGameTurn,
  updateWinnersInDb,
} from '../db';
import { EventType, ShotStatusType } from '../enums';
import { ISocket } from '../models';
import { updateWinners } from './updateWinners';

interface IAttackActionProps {
  gameId: number;
  indexPlayer: number;
  id: number;
  sockets: ISocket[];
  x: number;
  y: number;
}

export const universalAttack = ({
  gameId,
  indexPlayer,
  id,
  sockets,
  x,
  y,
}: IAttackActionProps) => {
  const { shotStatus, boundaryСells } = attack({ gameId, x, y, indexPlayer });
  const usersIndexesInGame = getUsersByGameId(gameId);
  const opponentsWs = getOpponentsWs(usersIndexesInGame);
  const enemyIndexInGame = getIndexEnemyByGameIdByUserId({
    idGame: gameId,
    indexPlayer,
  });

  const nextPlayerIndex =
    shotStatus === ShotStatusType.MISS ? enemyIndexInGame : indexPlayer;

  let isFinishGame = false;

  if (shotStatus !== ShotStatusType.MISS) {
    isFinishGame = checkIsFinishGame({
      idGame: gameId,
      currentUserIndex: indexPlayer,
    });
  }

  // TODO: Если игра финиш, то тут лишняя переменная.
  const turnGameData = JSON.stringify({
    type: EventType.TURN,
    id,
    data: JSON.stringify({
      currentPlayer: nextPlayerIndex,
    }),
  });

  // TODO: Если игра не финиш, то тут лишняя переменная.
  const finishGameData = JSON.stringify({
    type: EventType.FINISH,
    id,
    data: JSON.stringify({
      winPlayer: indexPlayer,
    }),
  });

  opponentsWs.forEach((socket) => {
    const attackData = JSON.stringify({
      type: EventType.ATTACK,
      id,
      data: JSON.stringify({
        position: { x, y },
        currentPlayer: indexPlayer,
        status: shotStatus,
      }),
    });
    socket.send(attackData);

    if (shotStatus === ShotStatusType.KILLED) {
      boundaryСells.forEach(({ x, y }) => {
        socket.send(
          JSON.stringify({
            type: EventType.ATTACK,
            id,
            data: JSON.stringify({
              position: { x, y },
              currentPlayer: indexPlayer,
              status: ShotStatusType.MISS,
            }),
          })
        );
      });
    }

    if (isFinishGame) {
      socket.send(finishGameData);
    } else {
      socket.send(turnGameData);
    }
  });

  if (isFinishGame) {
    const nameUser = getNameByIndexUser(indexPlayer);
    updateWinnersInDb(nameUser);
    updateWinners(sockets);
  } else {
    setGameTurn({ idGame: gameId, nextPlayerIndex });
  }
};
