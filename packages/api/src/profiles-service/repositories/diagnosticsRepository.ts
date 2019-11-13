import { EntityRepository, Repository } from 'typeorm';
import { Diagnostics } from 'profiles-service/entities';

@EntityRepository(Diagnostics)
export class DiagnosticsRepository extends Repository<Diagnostics> {
  async searchDiagnostics(itemName: string, city: string) {
    //return this.find({ where: { itemName } });
    return await this.createQueryBuilder('diagnostics')
      .where('diagnostics.itemName like :name', { name: '%' + itemName + '%' })
      .andWhere('diagnostics.city = :cityName', { cityName: city })
      .getMany();
  }
}
