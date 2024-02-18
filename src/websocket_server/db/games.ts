import { IGame, IShip } from '../models';

interface IAddShipsForGameProps {
  gameId: number;
  indexPlayer: number;
  ships: IShip[];
}

interface IGetShipsUserInGameProps {
  idGame: number;
  indexPlayer: number;
}

export let games: IGame[] = [];

const getGameById = (idGame: number) => games.find((game) => game.idGame === idGame);

export const getGameLength = () => games.length;

export const createNewGame = (game: IGame) => games.push(game);

export const addShipsForGame = ({
  gameId,
  indexPlayer,
  ships,
}: IAddShipsForGameProps) => {
  const updatedGames = games.map((game) => {
    if (game.idGame === gameId) {  
      return {
        ...game,
        usersGameInfo: game?.usersGameInfo?.[0]
          ? [game.usersGameInfo[0], { indexPlayer, ships }]
          : [{ indexPlayer, ships }],
      };
    }
    return game;
  });

  games = updatedGames;
};

export const getUsersByGameId = (idGame: number): [number, number] => {
  const gamesUsers = games.find((game) => game.idGame === idGame)?.usersGameInfo;
  return [gamesUsers[0].indexPlayer, gamesUsers[1].indexPlayer];
};

export const isAllUsersInGameAddShips = (idGame: number): boolean => {
  const currentGame = getGameById(idGame);
  return !!(currentGame?.usersGameInfo?.[0]?.ships && currentGame?.usersGameInfo?.[1]?.ships)
}

export const getShipsUserInGame = ({ idGame, indexPlayer }: IGetShipsUserInGameProps) => {
  const currentGame = getGameById(idGame);
  return currentGame?.usersGameInfo?.find((userInfo) => userInfo.indexPlayer === indexPlayer)?.ships
}
