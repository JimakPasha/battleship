import { IGame, IShip } from '../models'

interface IAddShipsForGameProps {
  gameId: number;
  indexPlayer: number;
  ships: IShip[];
}

let games: IGame[] = [];

export const getGameLength = () => games.length;

export const createNewGame = (game: IGame) => games.push(game);

export const addShipsForGame = ({ gameId, indexPlayer, ships }: IAddShipsForGameProps ) => {
  games = games.map((game) => {
    if (game.idGame === gameId) {
      return {
        ...game,
        usersGameInfo: game.usersGameInfo[0] ? [ game.usersGameInfo[0], { indexPlayer, ships } ] : [ { indexPlayer, ships } ]
      };
    }
    return game;
  })
}