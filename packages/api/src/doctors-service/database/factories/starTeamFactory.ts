import { StarTeam } from 'doctors-service/entities';

export const buildStarTeam = (attrs?: Partial<StarTeam>) => {
  const starTeam = new StarTeam();
  return Object.assign(starTeam, attrs);
};
