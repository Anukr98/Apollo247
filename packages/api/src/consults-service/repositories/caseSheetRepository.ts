import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheet, CASESHEET_STATUS } from 'consults-service/entities';
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

  saveMultipleCaseSheets(caseSheetAttrs: Partial<CaseSheet>[]) {
    return this.save(caseSheetAttrs).catch((createErrors) => {
      throw new AphError(AphErrorMessages.CREATE_CASESHEET_ERROR, undefined, { createErrors });
    });
  }

  updateMultipleCaseSheets(ids: string[], caseSheetAttrs: Partial<CaseSheet>) {
    return this.update(ids, caseSheetAttrs).catch((error) => {
      throw new AphError(AphErrorMessages.UPDATE_CONSULT_QUEUE_ERROR, undefined, { error });
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
      .orderBy('case_sheet.createdDate', 'DESC')
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

  getJDCaseSheetsByAppointmentId(ids: string[]) {
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .where('case_sheet.appointment IN (:...ids)', { ids })
      .getMany()
      .catch((error) => {
        throw new AphError(AphErrorMessages.GET_CASESHEET_ERROR, undefined, { error });
      });
  }

  async findAndUpdateJdConsultStatus(appointmentId: string) {
    const caseSheet = await this.findOne({
      where: { appointment: appointmentId, doctorType: DoctorType.JUNIOR },
    }).catch((error) => {
      throw new AphError(AphErrorMessages.GET_CASESHEET_ERROR, undefined, { error });
    });

    if (!caseSheet) throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID, undefined);

    return this.update(caseSheet.id, { isJdConsultStarted: true }).catch((error) => {
      throw new AphError(AphErrorMessages.UPDATE_CASESHEET_ERROR, undefined, { error });
    });
  }

  updateJDCaseSheet(appointmentId: string) {
    return this.createQueryBuilder()
      .update('case_sheet')
      .set({ status: CASESHEET_STATUS.COMPLETED })
      .where('"appointmentId" = :id', { id: appointmentId })
      .andWhere('doctorType = :type', { type: DoctorType.JUNIOR })
      .andWhere('status = :status', { status: CASESHEET_STATUS.PENDING })
      .execute();
  }
}
