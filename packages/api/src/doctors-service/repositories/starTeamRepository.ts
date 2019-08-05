import { EntityRepository, Repository } from 'typeorm';
import { StarTeam } from 'doctors-service/entities';

@EntityRepository(StarTeam)
export class StarTeamRepository extends Repository<StarTeam> {
  getTeamDoctorData(associatedDoctor: string, starDoctor: string) {
    return this.findOne({
      where: { associatedDoctor, starDoctor },
      relations: ['starDoctor', 'associatedDoctor'],
    });
  }

  /*checkIfAssociatedDoctorIsInStarTeam(associatedDoctor: string) {
    return this.findOne({
      where: { associatedDoctor, addedToStarTeam: true },
    });
  }*/

  ActivateTeamDoctor(id: string) {
    return this.update(id, { isActive: true });
  }

  removeFromStarteam(id: string) {
    return this.delete(id);
  }
}
