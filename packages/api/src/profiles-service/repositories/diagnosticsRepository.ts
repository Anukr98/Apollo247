import { EntityRepository, Repository } from 'typeorm';
import { Diagnostics, DiagnosticPincodeHubs } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(Diagnostics)
export class DiagnosticsRepository extends Repository<Diagnostics> {
  async searchDiagnostics(itemName: string, city: string) {
    console.log('itemName', itemName, 'city', city);
    //return this.find({ where: { itemName } });
    return await this.createQueryBuilder('diagnostics')
      .where('diagnostics.itemName like :name', { name: '%' + itemName + '%' })
      .andWhere('diagnostics.city = :cityName', { cityName: city })
      .andWhere('diagnostics."isActive" = true')
      .getMany();
  }

  async searchDiagnosticswithoutcity(itemName: string) {
    console.log('itemName', itemName, 'city', 'diagnosioticsrepo');
    //return this.find({ where: { itemName } });
    return await this.createQueryBuilder('diagnostics')
      .where('diagnostics.itemName like :name', { name: '%' + itemName + '%' })
      .andWhere('diagnostics."isActive" = true')
      .getMany();
  }

  async getDiagnosticsCites(cityName: string) {
    console.log('cityName', cityName);
    return await this.createQueryBuilder('diagnostics')
      .select([
        'max("city") as cityName',
        'max("state") as stateName',
        'max("cityId") as cityId',
        'max("stateId") as stateId',
      ])
      .groupBy('city')
      .getRawMany();
  }

  getHubDetails(route: string) {
    return DiagnosticPincodeHubs.findOne({ where: { route } });
  }

  findHubByZipCode(pincode: string) {
    return DiagnosticPincodeHubs.findOne({ where: { pincode } });
  }

  findDiagnosticById(itemId: number) {
    return this.findOne({ where: { itemId } });
  }

  async getDiagnosticsByName(itemName: string[]) {
    return this.createQueryBuilder('diagnostics')
      .where('diagnostics.itemName IN (:...name)', { name: itemName })
      .getMany()
      .catch((getDiagnosticError) => {
        throw new AphError(AphErrorMessages.INVALID_DIAGNOSIS_LIST, undefined, {
          getDiagnosticError,
        });
      });
  }

  async getDiagnosticByName(itemName: string) {
    return this.createQueryBuilder('diagnostics')
      .where('diagnostics.itemName = :name', { name: itemName })
      .getMany()
      .catch((getDiagnosticError) => {
        throw new AphError(AphErrorMessages.INVALID_DIAGNOSIS_LIST, undefined, {
          getDiagnosticError,
        });
      });
  }
}
