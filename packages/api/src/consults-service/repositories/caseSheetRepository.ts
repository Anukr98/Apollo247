import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheet } from 'consults-service/entities';
import { DoctorType } from 'doctors-service/entities';

@EntityRepository(CaseSheet)
export class CaseSheetRepository extends Repository<CaseSheet> {
  savecaseSheet(caseSheetAttrs: Partial<CaseSheet>) {
    return this.create(caseSheetAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_CASESHEET_ERROR, undefined, { createErrors });
      });
  }

  getCaseSheetByAppointmentId(appointmentId: string) {
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .getMany();
  }

  getJuniorDoctorCaseSheet(appointmentId: string) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType = :juniorDoctorType', { juniorDoctorType })
      .getOne();
  }

  getSeniorDoctorCaseSheet(appointmentId: string) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType != :juniorDoctorType', { juniorDoctorType })
      .getOne();
  }

  updateCaseSheet(id: string, caseSheetAttrs: Partial<CaseSheet>) {
    return this.update(id, caseSheetAttrs).catch((createErrors) => {
      throw new AphError(AphErrorMessages.UPDATE_CASESHEET_ERROR, undefined, { createErrors });
    });
  }

  getCaseSheetById(id: string) {
    return this.findOne({
      where: [{ id }],
      relations: ['appointment'],
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_CASESHEET_ERROR, undefined, { error });
    });
  }
}
