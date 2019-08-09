import { EntityRepository, Repository, Between } from 'typeorm';
import { Appointment, AppointmentSessions } from 'consults-service/entities';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { format } from 'date-fns';
import { ConsultHours, ConsultMode } from 'doctors-service/entities';

@EntityRepository(Appointment)
export class AppointmentRepository extends Repository<Appointment> {
  findById(appointmentId: string) {
    return this.findOne({ where: { appointmentId } });
  }

  findByDateDoctorId(doctorId: string, appointmentDate: Date) {
    return this.find({
      where: { doctorId, appointmentDate },
    });
  }

  saveAppointment(appointmentAttrs: Partial<Appointment>) {
    return this.create(appointmentAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  saveAppointmentSession(appointmentSessionAttrs: Partial<AppointmentSessions>) {
    return AppointmentSessions.create(appointmentSessionAttrs)
      .save()
      .catch((createErrors) => {
        throw new AphError(AphErrorMessages.CREATE_APPOINTMENT_ERROR, undefined, { createErrors });
      });
  }

  getPatientAppointments(doctorId: string, patientId: string) {
    return this.find({ where: { doctorId, patientId } });
  }

  getDoctorAppointments(doctorId: string, startDate: Date, endDate: Date) {
    return this.find({
      where: { doctorId, appointmentDateTime: Between(startDate, endDate) },
      order: { appointmentDateTime: 'DESC' },
    });
  }

  async getDoctorPatientVisitCount(doctorId: string, patientId: string[]) {
    const results = await this.createQueryBuilder('appointment')
      .select('appointment.patientId')
      .addSelect('COUNT(*) AS count')
      .where('appointment.patientId IN (:...patientList)', { patientList: patientId })
      .groupBy('appointment.patientId')
      .getRawMany();
    return results;
  }

  getPatientDateAppointments(appointmentDateTime: Date, patientId: string) {
    const inputDate = format(appointmentDateTime, 'yyyy-MM-dd');
    const startDate = new Date(inputDate + 'T00:00');
    const endDate = new Date(inputDate + 'T23:59');
    return this.find({ where: { patientId, appointmentDateTime: Between(startDate, endDate) } });
  }

  async findNextOpenAppointment(doctorId: string, consultHours: ConsultHours[]) {
    return {
      [ConsultMode.ONLINE]: new Date(),
      [ConsultMode.PHYSICAL]: new Date(),
    };
  }
}
