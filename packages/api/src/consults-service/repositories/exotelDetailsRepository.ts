import { EntityRepository, Repository } from 'typeorm';
import { ExotelDetails } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DOCTOR_CALL_TYPE } from 'notifications-service/constants';

@EntityRepository(ExotelDetails)
export class ExotelDetailsRepository extends Repository<ExotelDetails> {
  saveExotelCallDetails(exotelCallDetailsAttrs: Partial<ExotelDetails>) {
    return this.create(exotelCallDetailsAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CALL_DETAILS_ERROR, undefined, { createErrors });
      });
  }

  async updateCallDetails(id: string, exotelUpdates: Partial<ExotelDetails>) {
    return this.update(id, exotelUpdates);
  }

  getCallDetailsById(id: string) {
    return this.findOne({ where: { id }, relations: ['appointment'] });
  }

  getCallDetailsBySid(callSid: string) {
    return this.findOne({ where: { callSid }, relations: ['appointment'] });
  }

  getAllCallDetailsByStatus(status: string) {
    return this.find({ where: { status }, relations: ['appointment'] });
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointmentId }, relations: ['appointment'] });
  }

  findAllByAppointmentId(appointmentId: string) {
    return this.find({ where: { appointmentId }, relations: ['appointment'] });
  }

  findByJuniorAppointments(appointmentId: string) {
    return this.find({
      where: { appointmentId, doctorType: DOCTOR_CALL_TYPE.JUNIOR },
      relations: ['appointment'],
    });
  }

  findBySeniorAppointments(appointmentId: string) {
    return this.find({
      where: { appointmentId, doctorType: DOCTOR_CALL_TYPE.SENIOR },
      relations: ['appointment'],
    });
  }
}
