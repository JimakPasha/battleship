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

interface IGetEnemyByGameIdByUserIdProps {
  idGame: number;
  indexPlayer: number;
}

interface IAttackProps {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: number;
}

interface ISetGameTurnProps {
  idGame: number;
  nextPlayerIndex: number;
}

interface ICheckIsMyTurnProps {
  idGame: number;
  indexPlayerWantAttack: number;
}

interface ICheckIsFinishGameProps {
  idGame: number;
  currentUserIndex: number;
}

export let games: IGame[] = [];

export const getGameById = (idGame: number) =>
  games.find((game) => game.idGame === idGame);

export const getGameLength = () => games.length;

export const createNewGame = (game: IGame) => games.push(game);

export const addShipsForGame = ({
  gameId,
  indexPlayer,
  ships,
}: IAddShipsForGameProps) => {
  const updatedGames = games.map((game) => {
    if (game.idGame === gameId) {
      const shipsWithDecksPositions = ships.map(
        ({ direction, length, position, type }) => ({
          direction,
          length,
          position,
          type,
          decksPositions: Array(length)
            .fill(length)
            .map((_, index) => (direction ? position.y : position.x) + index),
        })
      );

      // TODO: можно turnIndexUser сделать рандомный. Или посмотреть в тз как вообще должно быть
      return {
        ...game,
        usersGameInfo: game?.usersGameInfo?.[0]
          ? [game.usersGameInfo[0], { indexPlayer, ships: shipsWithDecksPositions }]
          : [{ indexPlayer, ships: shipsWithDecksPositions }],
        turnIndexUser: indexPlayer,
      };
    }
    return game;
  });

  games = updatedGames;
};

export const getGameTurnByGameId = (idGame: number) => {
  return games.find((game) => game.idGame === idGame)?.turnIndexUser;
};

export const getUsersByGameId = (idGame: number): [number, number] => {
  const gamesUsers = games.find((game) => game.idGame === idGame)?.usersGameInfo;
  return [gamesUsers[0].indexPlayer, gamesUsers[1].indexPlayer];
};

export const getIndexEnemyByGameIdByUserId = ({
  idGame,
  indexPlayer,
}: IGetEnemyByGameIdByUserIdProps) => {
  const gamesUsers = games.find((game) => game.idGame === idGame)?.usersGameInfo;
  const indexEnemy = gamesUsers.find(
    (gameUser) => gameUser.indexPlayer != indexPlayer
  )?.indexPlayer;
  return indexEnemy;
};

export const isAllUsersInGameAddShips = (idGame: number): boolean => {
  const currentGame = getGameById(idGame);
  return !!(
    currentGame?.usersGameInfo?.[0]?.ships && currentGame?.usersGameInfo?.[1]?.ships
  );
};

export const getShipsUserInGame = ({ idGame, indexPlayer }: IGetShipsUserInGameProps) => {
  const currentGame = getGameById(idGame);
  const ships = currentGame?.usersGameInfo?.find(
    (userInfo) => userInfo.indexPlayer === indexPlayer
  )?.ships;
  return ships.map(({ direction, length, position, type }) => ({
    direction,
    length,
    position,
    type,
  }));
};

export const attack = ({ gameId, x, y, indexPlayer }: IAttackProps) => {
  const currentGame = getGameById(gameId);
  const enemysShips = currentGame?.usersGameInfo?.find(
    (userGameInfo) => userGameInfo.indexPlayer !== indexPlayer
  )?.ships;

  let shotShipIndex: number;
  let shotStatus: ShotStatusType = 'miss';
  let newDecksPositions: number[] = [];

  const setNewShotStatusAndIndex = ({
    decksPositions,
    index,
    position,
  }: {
    decksPositions: number[];
    index: number;
    position: number;
  }) => {
    shotShipIndex = index;

    if (decksPositions.length === 1) {
      shotStatus = 'killed';
    } else if (decksPositions.length > 1) {
      shotStatus = 'shot';
    }

    newDecksPositions = decksPositions.filter((n) => n !== position);
  };

  enemysShips?.forEach(({ decksPositions, direction, position, length }, index) => {
    if (direction && x === position.x && decksPositions.includes(y)) {
      setNewShotStatusAndIndex({ decksPositions, index, position: y });
    } else if (!direction && y === position.y && decksPositions.includes(x)) {
      setNewShotStatusAndIndex({ decksPositions, index, position: x });
    }
  });

  // TODO: есть небольшой косяк с условиями на 109 строчке и далее

  // TODO: это фиаско
  if (shotStatus !== 'miss') {
    games = games.map((game) => {
      if (game.idGame === gameId) {
        const newUsersGameInfo = game.usersGameInfo.map((userGameInfo) => {
          if (userGameInfo.indexPlayer !== indexPlayer) {
            const newShips = userGameInfo.ships.reduce((newShips, ship, index) => {
              if (index === shotShipIndex && newDecksPositions.length) {
                newShips.push({ ...ship, decksPositions: newDecksPositions });
              } else if (index === shotShipIndex && !newDecksPositions.length) {
                return newShips;
              } else {
                newShips.push(ship);
              }
              return newShips;
            }, []);
            return { ...userGameInfo, ships: newShips };
          }
          return userGameInfo;
        });
        return { ...game, usersGameInfo: newUsersGameInfo };
      }
      return game;
    });
  }

  // тут проверка что бд обновилась корректно
  // const currentGame2 = getGameById(gameId);
  // const enemysShips2 = currentGame2?.usersGameInfo?.find((userGameInfo) => userGameInfo.indexPlayer !== indexPlayer)?.ships;
  // console.log(enemysShips2);

  // TODO: разделить функцию, на логику и запросы к бд

  return shotStatus;
};

export const setGameTurn = ({ idGame, nextPlayerIndex }: ISetGameTurnProps) => {
  games = games.map((game) => {
    if (game.idGame === idGame) {
      return { ...game, turnIndexUser: nextPlayerIndex };
    }
    return game;
  });
};

export const checkIsMyTurn = ({ idGame, indexPlayerWantAttack }: ICheckIsMyTurnProps) => {
  const currentGame = getGameById(idGame);

  return currentGame.turnIndexUser === indexPlayerWantAttack;
};

export const checkIsFinishGame = ({
  idGame,
  currentUserIndex,
}: ICheckIsFinishGameProps) => {
  const indexEnemy = getIndexEnemyByGameIdByUserId({
    idGame,
    indexPlayer: currentUserIndex,
  });
  const currentGame = getGameById(idGame);
  const shipsEnemy = currentGame.usersGameInfo.find(
    ({ indexPlayer }) => indexPlayer === indexEnemy
  );

  return !shipsEnemy.ships.length;
};

export const deleteGameById = (idGame: number) => {
  games = games.filter((game) => game.idGame !== idGame);
};
