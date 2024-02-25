import { IDeck, IGame, IPosition, IShip, ShotStatusType } from '../models';

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

interface ISetNewShotStatusAndIndexProps {
  decks: IDeck[];
  index: number;
  position: number;
}

interface ICheckIsForbidenShotProps {
  idGame: number;
  indexPlayerWantAttack: number;
  shotPosition: IPosition;
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
        ({ direction, length, position: { x, y }, type }) => {
          const decks = Array(length)
            .fill(length)
            .map((_, index) => ({
              position: (direction ? y : x) + index,
              isWhole: true,
            }));

          // TODO: это фиаско
          const boundaryСellsEmpty = Array(length * 2 + 6).fill(null);
          const boundaryСells = boundaryСellsEmpty
            .map((_, index) => {
              if (index < 3) {
                return direction
                  ? { x: x - 1 + index, y: y - 1 }
                  : { x: x - 1, y: y - 1 + index };
              } else if (index < length + 3) {
                return direction
                  ? { x: x - 1, y: y + index - 3 }
                  : { x: x + index - 3, y: y - 1 };
              } else if (index < length * 2 + 3) {
                return direction
                  ? { x: x + 1, y: y + index - 3 - length }
                  : { x: x + index - 3 - length, y: y + 1 };
              } else {
                return direction
                  ? { x: x - 1 + (boundaryСellsEmpty.length - index - 1), y: y + length }
                  : { x: x + length, y: y - 1 + (boundaryСellsEmpty.length - index - 1) };
              }
            })
            .filter(({ x, y }) => x > -1 && y > -1 && x < 10 && y < 10);

          return {
            direction,
            length,
            position: { x, y },
            type,
            decks,
            boundaryСells,
          };
        }
      );

      return {
        ...game,
        usersGameInfo: game?.usersGameInfo?.[0]
          ? [
              game.usersGameInfo[0],
              { indexPlayer, ships: shipsWithDecksPositions, forbiddenPositions: [] },
            ]
          : [{ indexPlayer, ships: shipsWithDecksPositions, forbiddenPositions: [] }],
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
  let shotStatus = ShotStatusType.MISS as ShotStatusType;
  let newDecksPositions: IDeck[] = [];

  const setNewShotStatusAndIndex = ({
    decks,
    index,
    position,
  }: ISetNewShotStatusAndIndexProps) => {
    shotShipIndex = index;

    const decksWholeLength = decks.filter(({ isWhole }) => isWhole).length;

    if (decksWholeLength === 1) {
      shotStatus = ShotStatusType.KILLED;
    } else if (decksWholeLength > 1) {
      shotStatus = ShotStatusType.SHOT;
    }

    newDecksPositions = decks.map((deck) => ({
      ...deck,
      isWhole: deck.position === position ? !(deck.position === position) : deck.isWhole,
    }));
  };

  enemysShips?.forEach(({ decks, direction, position }, index) => {
    if (direction && x === position.x && decks.find(({ position }) => position === y)) {
      setNewShotStatusAndIndex({ decks, index, position: y });
    } else if (
      !direction &&
      y === position.y &&
      decks.find(({ position }) => position === x)
    ) {
      setNewShotStatusAndIndex({ decks, index, position: x });
    }
  });

  // TODO: это фиаско
  games = games.map((game) => {
    if (game.idGame === gameId) {
      const updatedUsersGameInfo = game.usersGameInfo.map((userGameInfo) => {
        if (userGameInfo.indexPlayer !== indexPlayer) {
          if (shotStatus === ShotStatusType.MISS) {
            return {
              ...userGameInfo,
              forbiddenPositions: [...userGameInfo.forbiddenPositions, { x, y }],
            };
          }

          let updatedForbiddenPositions: IPosition[] = [];

          const updatedShips = userGameInfo.ships.map((ship, indexShip) => {
            if (shotShipIndex === indexShip) {
              if (shotStatus === ShotStatusType.KILLED) {
                ship.boundaryСells.forEach(({ x, y }) => {
                  updatedForbiddenPositions.push({ x, y });
                });
              }
              return { ...ship, decks: newDecksPositions };
            }
            return ship;
          });

          return {
            ...userGameInfo,
            ships: updatedShips,
            forbiddenPositions: [
              ...userGameInfo.forbiddenPositions,
              ...updatedForbiddenPositions,
              { x, y },
            ],
          };
        }
        return userGameInfo;
      });
      return { ...game, usersGameInfo: updatedUsersGameInfo };
    }
    return game;
  });

  const boundaryСells = games
    .find((game) => game.idGame === gameId)
    .usersGameInfo.find((userGameInfo) => userGameInfo.indexPlayer !== indexPlayer)
    .ships.find((_, indexShip) => indexShip === shotShipIndex)?.boundaryСells;

  return { shotStatus, boundaryСells };
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

  let isFinishGame = true;

  shipsEnemy.ships.forEach(({ decks }) => {
    decks.forEach(({ isWhole }) => {
      if (isWhole) {
        isFinishGame = false;
      }
    })
  });

  return isFinishGame;
};

export const deleteGameById = (idGame: number) => {
  games = games.filter((game) => game.idGame !== idGame);
};

export const checkIsForbidenShot = ({
  idGame,
  indexPlayerWantAttack,
  shotPosition,
}: ICheckIsForbidenShotProps) => {
  const currentGame = getGameById(idGame);
  const enemyGameInfo = currentGame.usersGameInfo.find(
    ({ indexPlayer }) => indexPlayer !== indexPlayerWantAttack
  );

  let isForbidenShot = false;

  enemyGameInfo.forbiddenPositions.forEach(({ x, y }) => {
    if (shotPosition.x === x && shotPosition.y === y) {
      isForbidenShot = true;
    }
  });

  return isForbidenShot;
};
