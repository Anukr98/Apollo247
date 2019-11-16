import { EntityRepository, Repository } from 'typeorm';
import { DiagnosticOrgans, DiagnosticHotSellers } from 'profiles-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

@EntityRepository(DiagnosticOrgans)
export class DiagnosticOrgansRepository extends Repository<DiagnosticOrgans> {
  getDiagnosticOrgansList() {
    return this.find({
      where: {
        isActive: 'true',
      },
      relations: ['diagnostics'],
      order: {
        createdDate: 'DESC',
      },
    }).catch((getOrgansError) => {
      throw new AphError(AphErrorMessages.GET_COUPONS_ERROR, undefined, {
        getOrgansError,
      });
    });
  }

  getHotSellersList() {
    return DiagnosticHotSellers.find({
      where: {
        isActive: 'true',
      },
      relations: ['diagnostics'],
      order: {
        createdDate: 'DESC',
      },
    }).catch((getOrgansError) => {
      throw new AphError(AphErrorMessages.GET_COUPONS_ERROR, undefined, {
        getOrgansError,
      });
    });
  }
}
