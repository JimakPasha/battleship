export const enum ShotStatusType {
  MISS = 'miss',
  KILLED = 'killed',
  SHOT = 'shot',
}

type TypeOfSizeShip = 'small' | 'medium' | 'large' | 'huge';

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
  type: TypeOfSizeShip;
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
