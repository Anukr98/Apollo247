import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { Appointment, STATUS, ES_DOCTOR_SLOT_STATUS, APPOINTMENT_STATE } from "consults-service/entities";
import { updateDoctorSlotStatusES } from "doctors-service/entities/doctorElastic";
import { log } from "customWinstonLogger";

@EventSubscriber()
export class AppointmentEntitySubscriber implements EntitySubscriberInterface<Appointment> {
    afterUpdate(event: UpdateEvent<any>): Promise<any> | void {
        console.log(`After update called`);
        return updateElasticSlotsViaAppointMent(event);
    }
}


function updateElasticSlotsViaAppointMent(event: UpdateEvent<any>) {
    return new Promise(async (resolve, reject) => {
        try {
            const oldAppointment: Appointment = Appointment.create(event.databaseEntity as Appointment);
            const newAppointment: Appointment = Appointment.create(event.entity as Appointment);

            let isAppointmentCanceled: boolean = false;
            let isAppointmentRescheduled: boolean = false;

            //for some reasons the after update is being called multiple times
            if (!(oldAppointment && newAppointment && oldAppointment.appointmentDateTime && newAppointment.appointmentDateTime)) {
                return resolve();
            }

            isAppointmentCanceled = oldAppointment.status != newAppointment.status && newAppointment.status == STATUS.CANCELLED ? true : false;
            isAppointmentRescheduled = newAppointment.appointmentState == APPOINTMENT_STATE.RESCHEDULE;

            if (isAppointmentCanceled) {
                const response = await updateDoctorSlotStatusES(
                    oldAppointment.doctorId,
                    oldAppointment.appointmentType,
                    ES_DOCTOR_SLOT_STATUS.OPEN,
                    oldAppointment.appointmentDateTime,
                    oldAppointment
                )
                log('consultServiceLogger', `Appointment ${oldAppointment.id} cancelled, the Slot will now be opened`, "observer.ts", JSON.stringify(response), '');
            }
            else if (isAppointmentRescheduled) {
                // Open up older slot
                let response = await updateDoctorSlotStatusES(
                    oldAppointment.doctorId,
                    oldAppointment.appointmentType,
                    ES_DOCTOR_SLOT_STATUS.OPEN,
                    oldAppointment.appointmentDateTime,
                    oldAppointment
                );
                log('consultServiceLogger', `Appointment ${oldAppointment.id} is old appointment, this will be rescheduled, the Slot will now be opened`, "observer.ts", JSON.stringify(response), '');

                //Book new slot
                response = await updateDoctorSlotStatusES(
                    newAppointment.doctorId,
                    newAppointment.appointmentType,
                    ES_DOCTOR_SLOT_STATUS.BOOKED,
                    newAppointment.appointmentDateTime,
                    newAppointment
                );
                log('consultServiceLogger', `Appointment ${newAppointment.id} is the new appointment, the slot will be booked from rescheduling  `, "observer.ts", JSON.stringify(response), '');
            }

            return resolve();
        }
        catch (ex) {
            console.error(ex);
            log('consultServiceLogger', `After update failed with exception`, "observer.ts", '', ex);
            return reject(ex);
        }
    })
}


