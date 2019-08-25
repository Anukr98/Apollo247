import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheet } from 'consults-service/entities';

@EntityRepository(CaseSheet)
export class CaseSheetRepository extends Repository<CaseSheet> {
  savecaseSheet(caseSheetAttrs: Partial<CaseSheet>) {
    return this.create(caseSheetAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  getJuniorDoctorCaseSheet(appointmentId: string) {
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('case_sheet.medicinePrescription', 'medicinePrescription')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.createdDoctorId is null')
      .getOne();
  }

  getSeniorDoctorCaseSheet(appointmentId: string, createdDoctorId: string) {
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('case_sheet.medicinePrescription', 'medicinePrescription')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.createdDoctorId = :createdDoctorId', { createdDoctorId })
      .getOne();
  }
}
