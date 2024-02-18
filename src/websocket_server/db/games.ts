import { IGame, IShip, ShotStatusType } from '../models';

interface IAddShipsForGameProps {
  gameId: number;
  indexPlayer: number;
  ships: IShip[];
}

interface IGetShipsUserInGameProps {
  idGame: number;
  indexPlayer: number;
}

interface IAttackProps {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

export let games: IGame[] = [];

export const getGameById = (idGame: number) => games.find((game) => game.idGame === idGame);

export const getGameLength = () => games.length;

export const createNewGame = (game: IGame) => games.push(game);

export const addShipsForGame = ({
  gameId,
  indexPlayer,
  ships,
}: IAddShipsForGameProps) => {
  const updatedGames = games.map((game) => {
    if (game.idGame === gameId) {
      const shipsWithDecksPositions = ships.map(({ direction, length, positon, type }) => (
        {
          direction,
          length,
          positon,
          type,
          decksPositions: Array(length).fill(length).map((el, index) => el + index),
        }
      ));


      return {
        ...game,
        usersGameInfo: game?.usersGameInfo?.[0]
          ? [game.usersGameInfo[0], { indexPlayer, ships: shipsWithDecksPositions }]
          : [{ indexPlayer, ships: shipsWithDecksPositions }],
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
  const ships = currentGame?.usersGameInfo?.find((userInfo) => userInfo.indexPlayer === indexPlayer)?.ships;
  return ships.map(({ direction, length, positon, type }) => ({ direction, length, positon, type }));
}

export const attack = ({ gameId, x, y, indexPlayer }: IAttackProps) => {
  const currentGame = getGameById(gameId);
  const enemysShips = currentGame?.usersGameInfo?.find((userGameInfo) => userGameInfo.indexPlayer !== indexPlayer)?.ships;

  let shotShipIndex: number;
  let shotStatus: ShotStatusType = 'miss';
  let newDecksPositions: number[] = [];

  const setNewShotStatusAndIndex = ({ decksPositions, index, position }:  { decksPositions: number[], index: number, position: number }) => {
    shotShipIndex = index;

    if (decksPositions.length === 1) {
      shotStatus = 'killed';
    } else if (decksPositions.length > 1) {
      shotStatus = 'shot';
    }

    newDecksPositions = decksPositions.filter((n) => n !== position);
  }

  enemysShips?.map(({ decksPositions, direction, positon }, index) => {
    if (direction && x === positon.x && decksPositions.includes(y)) {
      setNewShotStatusAndIndex({ decksPositions, index, position: y });
    } else if (y === positon.y &&  decksPositions.includes(x)) {
      setNewShotStatusAndIndex({ decksPositions, index, position: x });
    }
  });


  // TODO: менять в bd decksPositions для нужной игры, игрока, коробля
  // TODO: разделить функцию, на логику и запросы к бд

  return shotStatus;

}
