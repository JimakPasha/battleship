import { IGame } from '../models'

const games: IGame[] = [];

export const createNewGame = (game: IGame) => games.push(game);

export const getGameLength = () => games.length;
