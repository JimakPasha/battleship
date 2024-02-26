import { checkIsForbidenShot, checkIsMyTurn } from '../db';
import { ISocket } from '../models';
import { universalAttack } from './universalAttack';

interface IUserAttackProps {
  id: number;
  sockets: ISocket[];
  parsedData: {
    gameId: number;
    indexPlayer: number;
    x: number;
    y: number;
  };
}

export const userAttack = ({ id, sockets, parsedData }: IUserAttackProps) => {
  const { gameId, x, y, indexPlayer } = parsedData;

  const isMyTurn = checkIsMyTurn({
    idGame: gameId,
    indexPlayerWantAttack: indexPlayer,
  });

  const isForbidenShot = checkIsForbidenShot({
    idGame: gameId,
    indexPlayerWantAttack: indexPlayer,
    shotPosition: { x, y },
  });

  if (isMyTurn && !isForbidenShot) {
    universalAttack({ gameId, id, indexPlayer, sockets, x, y });
  }
};
