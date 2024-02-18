type TypeOfSizeShip = 'small' | 'medium' | 'large' | 'huge';

interface ICoordinates {
  x: number;
  y: number;
}

export interface IShip {
  direction: boolean;
  length: number;
  positon: ICoordinates;
  type: TypeOfSizeShip;
}
interface IUserGameInfo {
  indexPlayer: number;
  ships: IShip[];
}

export interface IGame {
  idGame: number;
  usersGameInfo?: IUserGameInfo[];
}
