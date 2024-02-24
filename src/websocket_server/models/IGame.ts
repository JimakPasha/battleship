export type ShotStatusType = 'miss' | 'killed' | 'shot';

type TypeOfSizeShip = 'small' | 'medium' | 'large' | 'huge';

interface IPositions {
  x: number;
  y: number;
}

export interface IShip {
  direction: boolean;
  length: number;
  position: IPositions;
  type: TypeOfSizeShip;
  decksPositions: number[];
}

interface IUserGameInfo {
  indexPlayer: number;
  ships: IShip[];
}

export interface IGame {
  idGame: number;
  usersGameInfo?: IUserGameInfo[];
  turnIndexUser?: number;
}
