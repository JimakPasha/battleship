import { checkIsForbidenShot, checkIsMyTurn } from '../db';
import { ISocket } from '../models';
import { generateRandomPosition } from '../utils';
import { universalAttack } from './universalAttack';

interface IRandomAttackProps {
  id: number;
  sockets: ISocket[];
  parsedData: {
    gameId: number;
    indexPlayer: number;
  };
}

export const randomAttack = ({ id, sockets, parsedData }: IRandomAttackProps) => {
  const { gameId, indexPlayer } = parsedData;

  let isForbidenShot = true;
  let randomPostitionX = 0;
  let randomPostitionY = 0;

  while (isForbidenShot) {
    randomPostitionX = generateRandomPosition();
    randomPostitionY = generateRandomPosition();

    isForbidenShot = checkIsForbidenShot({
      idGame: gameId,
      indexPlayerWantAttack: indexPlayer,
      shotPosition: { x: randomPostitionX, y: randomPostitionY },
    });
  }

  universalAttack({
    gameId,
    id,
    indexPlayer,
    sockets,
    x: randomPostitionX,
    y: randomPostitionY,
  });
};
