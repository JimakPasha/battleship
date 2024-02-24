import { IWinner } from '../models';

let winners: IWinner[] = [];

export const getWinners = () => winners;

export const updateWinnersInDb = (name: string) => {
  const isWonEarlier = winners.find((winner) => winner.name === name);

  if (isWonEarlier) {
    winners = winners.map((winner) => {
      if (winner.name === name) {
        return { ...winner, wins: winner.wins + 1 }
      }
      return winner;
    });
  } else {
    winners.push({ name, wins: 1 });
  }
};
