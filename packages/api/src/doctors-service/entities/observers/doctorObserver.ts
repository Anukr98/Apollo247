import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from "typeorm";
import { Appointment, STATUS, ES_DOCTOR_SLOT_STATUS } from "consults-service/entities";
import { Doctor } from "doctors-service/entities";
import { updateDoctorSlotStatusES } from "doctors-service/entities/doctorElastic";
import { log } from "customWinstonLogger";

@EventSubscriber()
export class DoctorEntitySubscriber implements EntitySubscriberInterface<Doctor> {
}



