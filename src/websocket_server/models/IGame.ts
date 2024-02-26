export interface IPosition {
  x: number;
  y: number;
}

export interface IDeck {
  position: number;
  isWhole: boolean;
}

export interface IShip {
  direction: boolean;
  length: number;
  position: IPosition;
  decks: IDeck[];
  boundaryСells: IPosition[];
}

interface IUserGameInfo {
  indexPlayer: number;
  ships: IShip[];
  forbiddenPositions: IPosition[];
}

export interface IGame {
  idGame: number;
  usersGameInfo?: IUserGameInfo[];
  turnIndexUser?: number;
}
