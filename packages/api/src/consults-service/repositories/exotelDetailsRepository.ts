import { EntityRepository, Repository } from 'typeorm';
import { ExotelDetails } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { differenceInSeconds } from 'date-fns';
import { DOCTOR_CALL_TYPE } from 'notifications-service/resolvers/notifications';

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

    let updateObj = {
      status: exotelUpdates.status,
      callEndTime: exotelUpdates.callEndTime,
      totalCallDuration: exotelUpdates.totalCallDuration,
      recordingUrl: exotelUpdates.recordingUrl,
      updatedDate: new Date(),
      price: exotelUpdates.price,
    }
    
    if(exotelUpdates.status == 'completed'){
      updateObj = Object.assign(updateObj, {patientPickedUp: true, doctorPickedUp: true });
    }

    return this.update(id, updateObj);
  }

  getCallDetailsById(id: string) {
    return this.findOne({ where: { id } });
  }

  getCallDetailsBySid(callSid: string) {
    return this.findOne({ where: { callSid } });
  }

  getAllCallDetailsByStatus(status: string) {
    return this.find({ where: { status } });
  }

  findByAppointmentId(appointmentId: string) {
    return this.findOne({ where: { appointmentId } });
  }

  findAllByAppointmentId(appointmentId: string) {
    return this.find({ where: { appointmentId } });
  }

  findByJuniorAppointments(appointmentId: string) {
    return this.find({
      where: { appointmentId, doctorType: DOCTOR_CALL_TYPE.JUNIOR },
    });
  }

  findBySeniorAppointments(appointmentId: string) {
    return this.find({
      where: { appointmentId, doctorType: DOCTOR_CALL_TYPE.SENIOR },
    });
  }

}
