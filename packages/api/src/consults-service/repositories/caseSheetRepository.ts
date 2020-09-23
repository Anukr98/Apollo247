import { EntityRepository, Repository } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { CaseSheet, CASESHEET_STATUS } from 'consults-service/entities';
import { DoctorType } from 'doctors-service/entities';
import { format, addDays } from 'date-fns';
import { STATUS } from 'consults-service/entities';
import { ApiConstants } from 'ApiConstants';

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

  getJDCaseSheetByAppointmentId(appointmentId: string) {
    return this.createQueryBuilder('case_sheet')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType = :type', { type: DoctorType.JUNIOR })
      .orderBy('case_sheet.createdDate', 'DESC')
      .getOne()
      .catch((error) => {
        throw new AphError(AphErrorMessages.GET_CASESHEET_ERROR, undefined, { error });
      });
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

  getJDMultipleCaseSheets(appointmentId: string) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType = :juniorDoctorType', { juniorDoctorType })
      .orderBy('case_sheet.createdDate', 'DESC')
      .getMany();
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

  updateCaseSheet(id: string, caseSheetAttrs: Partial<CaseSheet>, caseSheet: CaseSheet) {
    const modifiedCaseSheet = this.create(caseSheet);
    Object.assign(modifiedCaseSheet, { ...caseSheetAttrs });
    return modifiedCaseSheet.save().catch((createErrors) => {
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
      .andWhere('case_sheet.doctorType = :type', { type: DoctorType.JUNIOR })
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

  async updateAllJDCaseSheet(appointmentId: string) {
    const JDCaseSheetDetails: CaseSheet[] = await this.getJDMultipleCaseSheets(appointmentId);
    if (JDCaseSheetDetails.length == 0)
      throw new AphError(AphErrorMessages.INVALID_CASESHEET_ID, undefined);
    JDCaseSheetDetails.forEach((item) => {
      Object.assign(item, {
        status: CASESHEET_STATUS.COMPLETED,
      });
    });

    console.log('JDCaseSheetDetails::', JDCaseSheetDetails);
    return this.save(JDCaseSheetDetails).catch((appointmentError) => {
      throw new AphError(AphErrorMessages.UPDATE_CASESHEET_ERROR, undefined, { appointmentError });
    });
  }

  getSeniorDoctorMultipleCaseSheet(appointmentId: string) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType != :juniorDoctorType', { juniorDoctorType })
      .orderBy('case_sheet.version', 'DESC')
      .getMany();
  }

  getSeniorDoctorLatestCaseSheet(appointmentId: string) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType != :juniorDoctorType', { juniorDoctorType })
      .orderBy('case_sheet.version', 'DESC')
      .getOne();
  }

  getSDLatestCompletedCaseSheetByAppointments(appointmentId: string[]) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment in (:...appointmentId)', { appointmentId })
      .andWhere('case_sheet.doctorType != :juniorDoctorType', { juniorDoctorType })
      .andWhere('case_sheet.sentToPatient = :sentToPatient', { sentToPatient: true })
      .orderBy('case_sheet.version', 'DESC')
      .getMany();
  }

  getSDLatestCompletedCaseSheet(appointmentId: string) {
    const juniorDoctorType = DoctorType.JUNIOR;
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .leftJoinAndSelect('appointment.appointmentDocuments', 'appointmentDocuments')
      .where('case_sheet.appointment = :appointmentId', { appointmentId })
      .andWhere('case_sheet.doctorType != :juniorDoctorType', { juniorDoctorType })
      .andWhere('case_sheet.sentToPatient = :sentToPatient', { sentToPatient: true })
      .orderBy('case_sheet.version', 'DESC')
      .getOne();
  }

  getAllAppointmentsToBeArchived(currentDate: Date) {
    const startDate = new Date(format(addDays(currentDate, -1), 'yyyy-MM-dd') + 'T18:30');
    const endDate = new Date(format(currentDate, 'yyyy-MM-dd') + 'T18:29');
    return this.createQueryBuilder('case_sheet')
      .leftJoinAndSelect('case_sheet.appointment', 'appointment')
      .where(
        ` appointment.sdConsultationDate + (CASE WHEN (case_sheet.followUpAfterInDays IS NOT NULL ) THEN case_sheet.followUpAfterInDays ELSE ${
          ApiConstants.FREE_CHAT_DAYS
        } END * ${"'1 day'::INTERVAL"}) >= :startDate `,
        { startDate }
      )
      .andWhere(
        ` appointment.sdConsultationDate + (CASE WHEN (case_sheet.followUpAfterInDays IS NOT NULL ) THEN case_sheet.followUpAfterInDays ELSE ${
          ApiConstants.FREE_CHAT_DAYS
        } END * ${"'1 day'::INTERVAL"}) < :endDate `,
        { endDate }
      )
      .andWhere(` appointment.status = :status`, { status: STATUS.COMPLETED })
      .select('appointment.id')
      .groupBy('appointment.id')
      .getRawMany();
  }
}
