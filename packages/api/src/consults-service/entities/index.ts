import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { IsDate } from 'class-validator';
import { DoctorType } from 'doctors-service/entities';

export enum patientLogSort {
  MOST_RECENT = 'MOST_RECENT',
  NUMBER_OF_CONSULTS = 'NUMBER_OF_CONSULTS',
  PATIENT_NAME_A_TO_Z = 'PATIENT_NAME_A_TO_Z',
  PATIENT_NAME_Z_TO_A = 'PATIENT_NAME_Z_TO_A',
}

export enum patientLogType {
  ALL = 'ALL',
  FOLLOW_UP = 'FOLLOW_UP',
  REGULAR = 'REGULAR',
}

export enum APPOINTMENT_TYPE {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
  BOTH = 'BOTH',
}

export enum STATUS {
  PENDING = 'PENDING',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  JUNIOR_DOCTOR_STARTED = 'JUNIOR_DOCTOR_STARTED',
  JUNIOR_DOCTOR_ENDED = 'JUNIOR_DOCTOR_ENDED',
  CALL_ABANDON = 'CALL_ABANDON',
  UNAVAILABLE_MEDMANTRA = 'UNAVAILABLE_MEDMANTRA',
}

export enum APPOINTMENT_STATE {
  NEW = 'NEW',
  TRANSFER = 'TRANSFER',
  RESCHEDULE = 'RESCHEDULE',
  TRANSFERRED = 'TRANSFERRED',
  AWAITING_TRANSFER = 'AWAITING_TRANSFER',
  AWAITING_RESCHEDULE = 'AWAITING_RESCHEDULE',
}

export enum REQUEST_ROLES {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  JUNIOR = 'JUNIOR',
}

export enum TRANSFER_STATUS {
  INITIATED = 'INITIATED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum TRANSFER_INITIATED_TYPE {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum APPOINTMENT_PAYMENT_TYPE {
  ONLINE = 'ONLINE',
}

export enum CONSULTS_RX_SEARCH_FILTER {
  ONLINE = 'ONLINE',
  PHYSICAL = 'PHYSICAL',
  PRESCRIPTION = 'PRESCRIPTION',
}

export enum BOOKINGSOURCE {
  MOBILE = 'MOBILE',
  WEB = 'WEB',
}

export enum DEVICETYPE {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

//Appointment starts
@Entity()
export class Appointment extends BaseEntity {
  @Column({ type: 'float8', nullable: true })
  actualAmount: number;

  @Column({ nullable: true, default: 0 })
  apolloAppointmentId: number;

  @Column({ type: 'timestamp' })
  @IsDate()
  appointmentDateTime: Date;

  @Column()
  appointmentType: APPOINTMENT_TYPE;

  @Column({ nullable: true })
  appointmentState: APPOINTMENT_STATE;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  bookingDate: Date;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  cancelledDate: Date;

  @Column({ nullable: true })
  cancelledBy: REQUEST_ROLES;

  @Column({ nullable: true })
  cancelledById: string;

  @OneToMany((type) => CaseSheet, (caseSheet) => caseSheet.appointment)
  caseSheet: CaseSheet[];

  @Column({ nullable: true })
  couponCode: string;

  @Column({ generated: 'increment' })
  displayId: number;

  @Column({ type: 'float8', nullable: true })
  discountedAmount: number;

  @Column({ nullable: true })
  doctorCancelReason: string;

  @Column()
  doctorId: string;

  @Column({ nullable: true })
  followUpParentId: string;

  @Column({ nullable: true })
  hospitalId: string;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, default: false })
  isFollowUp: Boolean;

  @Column({ nullable: true, default: false })
  isFollowPaid: Boolean;

  @Column({ nullable: true, default: false })
  isJdQuestionsComplete: Boolean;

  @Column({ nullable: true, default: false })
  isTransfer: Boolean;

  @Column({ nullable: true, default: false })
  isConsultStarted: Boolean;

  @Column({ nullable: true, default: false })
  isSeniorConsultStarted: Boolean;

  @Column({ nullable: true })
  patientCancelReason: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column({ nullable: true })
  parentId: string;

  @Column({ default: '0' })
  paymentOrderId: string;

  @Column({ default: 0 })
  rescheduleCount: number;

  @Column({ default: 0 })
  rescheduleCountByDoctor: number;

  @Column()
  status: STATUS;

  @Column({ nullable: true })
  transferParentId: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @Column({ nullable: true, type: 'text' })
  symptoms: string;

  @Column({ default: BOOKINGSOURCE.MOBILE })
  bookingSource: BOOKINGSOURCE;

  @Column({ nullable: true })
  deviceType: DEVICETYPE;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @OneToMany(
    (type) => TransferAppointmentDetails,
    (transferAppointmentDetails) => transferAppointmentDetails.appointment
  )
  transferAppointmentDetails: TransferAppointmentDetails[];

  @OneToMany(
    (type) => RescheduleAppointmentDetails,
    (rescheduleAppointmentDetails) => rescheduleAppointmentDetails.appointment
  )
  rescheduleAppointmentDetails: RescheduleAppointmentDetails[];

  @OneToMany(
    (type) => AppointmentPayments,
    (appointmentPayments) => appointmentPayments.appointment
  )
  appointmentPayments: AppointmentPayments[];

  @OneToMany((type) => AppointmentNoShow, (appointmentNoShow) => appointmentNoShow.appointment)
  appointmentNoShow: AppointmentNoShow[];

  @OneToMany(
    (type) => AppointmentDocuments,
    (appointmentDocuments) => appointmentDocuments.appointment
  )
  appointmentDocuments: AppointmentDocuments[];

  @OneToMany((type) => AuditHistory, (auditHistory) => auditHistory.appointment)
  auditHistory: AuditHistory[];
}
//Appointment ends

//AppointmentDocuments starts
@Entity()
export class AppointmentDocuments extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  documentPath: string;

  @Column({ nullable: true })
  prismFileId: string;

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentDocuments)
  appointment: Appointment;
}
//AppointmentDocuments ends

//AppointmentPayments starts
@Entity()
export class AppointmentPayments extends BaseEntity {
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  amountPaid: number;

  @Column({ nullable: true })
  bankTxnId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true, type: 'timestamp' })
  paymentDateTime: Date;

  @Column({ nullable: true })
  paymentRefId: string;

  @Column()
  paymentStatus: string;

  @Column()
  paymentType: APPOINTMENT_PAYMENT_TYPE;

  @Column({ nullable: true, type: 'text' })
  responseCode: string;

  @Column({ type: 'text' })
  responseMessage: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentPayments)
  appointment: Appointment;
}
//AppointmentPayments ends

//AppointmentSessions starts
@Entity()
export class AppointmentSessions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne((type) => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Column({ type: 'timestamp', nullable: true })
  consultStartDateTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  consultEndDateTime: Date;

  @Column()
  sessionId: string;

  @Column()
  doctorToken: string;

  @Column({ nullable: true })
  patientToken: string;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//AppointmentSessions ends

//Appointment call details start

//Appointment call details end
@Entity()
export class AppointmentCallDetails extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  callType: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true })
  doctorName: string;

  @Column()
  doctorType: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  callDuration: number;

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentPayments)
  appointment: Appointment;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

//Junior AppointmentSessions starts
@Entity()
export class JuniorAppointmentSessions extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne((type) => Appointment)
  @JoinColumn()
  appointment: Appointment;

  @Column({ type: 'timestamp', nullable: true })
  consultStartDateTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  consultEndDateTime: Date;

  @Column()
  sessionId: string;

  @Column()
  juniorDoctorToken: string;

  @Column({ nullable: true })
  patientToken: string;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Junior AppointmentSessions ends

//case sheet starts
export enum MEDICINE_FORM_TYPES {
  GEL_LOTION_OINTMENT = 'GEL_LOTION_OINTMENT',
  OTHERS = 'OTHERS',
}
export enum MEDICINE_CONSUMPTION_DURATION {
  DAYS = 'DAYS',
  MONTHS = 'MONTHS',
  WEEKS = 'WEEKS',
}
export enum MEDICINE_FREQUENCY {
  AS_NEEDED = 'AS_NEEDED',
  FIVE_TIMES_A_DAY = 'FIVE_TIMES_A_DAY',
  FOUR_TIMES_A_DAY = 'FOUR_TIMES_A_DAY',
  ONCE_A_DAY = 'ONCE_A_DAY',
  THRICE_A_DAY = 'THRICE_A_DAY',
  TWICE_A_DAY = 'TWICE_A_DAY',
}
export enum MEDICINE_TIMINGS {
  AS_NEEDED = 'AS_NEEDED',
  EVENING = 'EVENING',
  MORNING = 'MORNING',
  NIGHT = 'NIGHT',
  NOON = 'NOON',
}
export enum MEDICINE_TO_BE_TAKEN {
  AFTER_FOOD = 'AFTER_FOOD',
  BEFORE_FOOD = 'BEFORE_FOOD',
}

export enum CASESHEET_STATUS {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

export enum MEDICINE_UNIT {
  BOTTLE = 'BOTTLE',
  CAPSULE = 'CAPSULE',
  CREAM = 'CREAM',
  DROPS = 'DROPS',
  GEL = 'GEL',
  INJECTION = 'INJECTION',
  LOTION = 'LOTION',
  ML = 'ML',
  NA = 'NA',
  OINTMENT = 'OINTMENT',
  OTHERS = 'OTHERS',
  POWDER = 'POWDER',
  ROTACAPS = 'ROTACAPS',
  SACHET = 'SACHET',
  SOAP = 'SOAP',
  SOLUTION = 'SOLUTION',
  SPRAY = 'SPRAY',
  SUSPENSION = 'SUSPENSION',
  SYRUP = 'SYRUP',
  TABLET = 'TABLET',
}

export enum AUDIT_STATUS {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}
export type CaseSheetMedicinePrescription = {
  externalId: string;
  id: string;
  medicineConsumptionDuration: string;
  medicineConsumptionDurationInDays: number;
  medicineConsumptionDurationUnit: MEDICINE_CONSUMPTION_DURATION;
  medicineDosage: string; //take
  medicineFormTypes: MEDICINE_FORM_TYPES;
  medicineFrequency: MEDICINE_FREQUENCY;
  medicineInstructions?: string;
  medicineName: string;
  medicineTimings: MEDICINE_TIMINGS[];
  medicineToBeTaken: MEDICINE_TO_BE_TAKEN[];
  medicineUnit: MEDICINE_UNIT;
};
export type CaseSheetDiagnosis = { name: string };
export type CaseSheetDiagnosisPrescription = {
  itemname: string;
};
export type CaseSheetOtherInstruction = { instruction: string };
export type CaseSheetSymptom = {
  details: string;
  howOften: string;
  severity: string;
  since: string;
  symptom: string;
};

@Entity()
export class CaseSheet extends BaseEntity {
  @ManyToOne((type) => Appointment, (appointment) => appointment.caseSheet)
  appointment: Appointment;

  @Column({ nullable: true, type: 'text' })
  blobName: string;

  @Column({ nullable: true, type: 'text' })
  prismFileId: string;

  @Column()
  consultType: APPOINTMENT_TYPE;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  createdDoctorId: string;

  @Column({ default: DoctorType.JUNIOR })
  doctorType: DoctorType;

  @Column({ nullable: true, type: 'json' })
  diagnosis: string;

  @Column({ nullable: true, type: 'json' })
  diagnosticPrescription: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true, default: false })
  followUp: Boolean;

  @Column({ nullable: true })
  followUpAfterInDays: number;

  @Column({ nullable: true })
  followUpDate: Date;

  @Column({ nullable: true })
  followUpConsultType: APPOINTMENT_TYPE;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'json' })
  medicinePrescription: string;

  @Column({ nullable: true, type: 'text' })
  notes: string;

  @Column({ nullable: true, type: 'json' })
  otherInstructions: string;

  @Column({ nullable: true })
  patientId: string;

  @Column({ default: () => 0, type: 'float' })
  preperationTimeInSeconds: number;

  @Column({ nullable: true, default: false })
  sentToPatient: boolean;

  @Column({ nullable: true, default: CASESHEET_STATUS.PENDING })
  status: CASESHEET_STATUS;

  @Column({ nullable: true, type: 'json' })
  symptoms: string;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }

  @Column({ default: AUDIT_STATUS.PENDING })
  auditStatus: AUDIT_STATUS;
}
//case sheet ends

///////////////////////////////////////////////////////////
// ConsultQueueItem
///////////////////////////////////////////////////////////
@Entity()
export class ConsultQueueItem extends BaseEntity {
  @Column()
  appointmentId: string;

  @Column()
  createdDate: Date;

  @Column()
  doctorId: string;

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isActive: boolean;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }
}
///////////////////////////////////////////////////////////

//transfer-appointment starts
@Entity()
export class TransferAppointmentDetails extends BaseEntity {
  @ManyToOne((type) => Appointment, (appointment) => appointment.transferAppointmentDetails)
  appointment: Appointment;

  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  transferReason: string;

  @Column({ nullable: true })
  transferredDoctorId: string;

  @Column()
  transferInitiatedBy: TRANSFER_INITIATED_TYPE;

  @Column({ nullable: true })
  transferInitiatedId: string;

  @Column({ nullable: true })
  transferredSpecialtyId: string;

  @Column({ nullable: true, type: 'text' })
  transferNotes: string;

  @Column()
  transferStatus: TRANSFER_STATUS;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//transfer apppointment ends

//Reschedule-appointment starts
@Entity()
export class RescheduleAppointmentDetails extends BaseEntity {
  @ManyToOne((type) => Appointment, (appointment) => appointment.rescheduleAppointmentDetails)
  appointment: Appointment;

  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  rescheduledDateTime: Date;

  @Column({ type: 'text' })
  rescheduleReason: string;

  @Column()
  rescheduleInitiatedBy: TRANSFER_INITIATED_TYPE;

  @Column({ nullable: true })
  rescheduleInitiatedId: string;

  @Column()
  rescheduleStatus: TRANSFER_STATUS;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Reschedule apppointment ends

//DoctorNextAvaialbleSlots starts
@Entity()
export class DoctorNextAvaialbleSlots extends BaseEntity {
  @Column()
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  doctorId: string;

  @Column({ nullable: true, type: 'timestamp' })
  physicalSlot: Date;

  @Column({ nullable: true, type: 'timestamp' })
  onlineSlot: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//DoctorNextAvaialbleSlots ends

//Appointment no show details start
@Entity()
export class AppointmentNoShow extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  noShowType: REQUEST_ROLES;

  @Column({ default: STATUS.NO_SHOW })
  noShowStatus: STATUS;

  @ManyToOne((type) => Appointment, (appointment) => appointment.appointmentNoShow)
  appointment: Appointment;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Appointment no show details end

//documents summary starts
@Entity()
export class PhrDocumentsSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentDate: Date;

  @Column({ default: 0 })
  appointmentDoc: number;

  @Column({ default: 0 })
  medicineOrderDoc: number;

  @Column({ default: 0 })
  standAloneDoc: number;

  @Column({ default: 0 })
  newUser: number;

  @Column({ default: 0 })
  oldUser: number;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

//SD dashboard summary starts
@Entity()
export class FeedbackDashboardSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ratingDate: Date;

  @Column({ default: 0 })
  goodRating: number;

  @Column({ default: 0 })
  greatRating: number;

  @Column({ default: 0 })
  poorRating: number;

  @Column({ default: 0 })
  okRating: number;

  @Column({ default: 0 })
  noRating: number;

  @Column({ default: 0 })
  helpTickets: number;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

//JD dashboard summary starts
@Entity()
export class JdDashboardSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @Column()
  doctorName: string;

  @Column({ default: '' })
  adminIds: string;

  @Column()
  appointmentDateTime: Date;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  waitTimePerChat: number;

  //Case sheet fill time per chat, Avg time
  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  caseSheetFillTime: number;

  @Column({ default: 0 })
  totalCompletedChats: number;

  //Total time taken per chat, Avg  time
  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  timePerChat: number;

  @Column({ default: 0 })
  audioChats: number;

  @Column({ default: 0 })
  videoChats: number;

  @Column({ default: 0 })
  chatConsults: number;

  @Column({ default: 0 })
  jdsUtilization: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  loggedInHours: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  awayHours: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  totalConsultationTime: number;

  @Column({ default: 0 })
  casesCompleted: number;

  //No. of cases started less than 15 mins before scheduled appointment
  @Column({ default: 0 })
  cases15Less: number;

  @Column({ default: 0 })
  casesOngoing: number;

  //% of on-time consultations (start)
  @Column({ default: 0 })
  startOnTimeConsults: number;

  //% of consults within 15 mins
  @Column({ default: 0 })
  completeWithin15: number;

  //% of consults more than 15 mins
  @Column({ default: 0 })
  completeMore15: number;

  //Avg. time for consult
  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  avgTimePerConsult: number;

  //total allocated chats
  @Column({ default: 0 })
  totalAllocatedChats: number;

  @Column({ default: 0 })
  caseSheetNotSatisfactory: number;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//JD dashboard summary end

//SD dashboard summary starts
@Entity()
export class SdDashboardSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @Column()
  doctorName: string;

  @Column({ default: '' })
  adminIds: string;

  @Column()
  appointmentDateTime: Date;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  casesheetPrepTime: number;

  @Column({ default: 0 })
  totalConsultations: number;

  @Column({ default: 0 })
  totalVirtualConsultations: number;

  @Column({ default: 0 })
  totalPhysicalConsultations: number;

  @Column({ default: 0 })
  onTimeConsultations: number;

  @Column({ default: 0 })
  within15Consultations: number;

  @Column({ default: 0 })
  moreThan15Consultations: number;

  @Column({ default: 0 })
  audioConsultations: number;

  @Column({ default: 0 })
  videoConsultations: number;

  @Column({ default: 0 })
  chatConsultations: number;

  @Column({ default: 0 })
  rescheduledByDoctor: number;

  @Column({ default: 0 })
  rescheduledByPatient: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  timePerConsult: number;

  @Column({ default: 0 })
  consultSlots: number;

  @Column({ default: 0 })
  totalFollowUp: number;

  @Column({ default: 0 })
  paidFollowUp: number;

  @Column({ default: 0 })
  cancelledByPatient: number;

  @Column({ default: 0 })
  unPaidFollowUp: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  loggedInHours: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  awayHours: number;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  totalConsultationTime: number;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//SD dashboard summary end

//Doctor fee summary starts
@Entity()
export class DoctorFeeSummary extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  appointmentDateTime: Date;

  @Column()
  doctorId: string;

  @Column({ default: '' })
  doctorName: string;

  @Column({ default: '' })
  specialtiyId: string;

  @Column({ default: '' })
  specialityName: string;

  @Column({ default: '' })
  areaName: string;

  @Column('decimal', { precision: 10, scale: 5, default: 0 })
  amountPaid: number;

  @Column()
  appointmentsCount: number;

  @Column()
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}
//Doctor fee summary end

// PlannedDoctors starts

@Entity()
export class PlannedDoctors extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  availabilityDate: Date;

  @Column()
  speciality: string;

  @Column()
  specialityId: string;

  @Column()
  morning: Number;

  @Column()
  afternoon: Number;

  @Column()
  evening: Number;

  @Column()
  night: Number;

  @Column({ default: 10 })
  plannedMorning: Number;

  @Column({ default: 10 })
  plannedAfternoon: Number;

  @Column({ default: 10 })
  plannedEvening: Number;

  @Column({ default: 10 })
  plannedNight: Number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @BeforeInsert()
  updateDateCreation() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  updateDateUpdate() {
    this.updatedDate = new Date();
  }
}

// PlannedDoctors ends
//auditor history table start
@Entity()
export class AuditHistory extends BaseEntity {
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  doctorType: string;

  @ManyToOne((type) => Appointment, (appointment) => appointment.auditHistory)
  appointment: Appointment;

  @Column()
  auditorId: string;

  @Column({ nullable: true, type: 'json' })
  comment: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ nullable: true })
  qaRating: number;
}

//auditor history table end

//CurrentAvailabilityStatus start
@Entity()
export class CurrentAvailabilityStatus extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  specialityId: string;

  @Column({ nullable: true })
  specialtyName: string;

  @Column({ nullable: true })
  totalCount: number;

  @Column({ nullable: true })
  onlineCount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}

@Entity()
export class utilizationCapacity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  specialityId: string;

  @Column({ nullable: true })
  specialtyName: string;

  @Column({ nullable: true })
  slotsBooked: number;

  @Column({ nullable: true })
  doctorSlots: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}

//CurrentAvailabilityStatus end

///////////////////////////////////////////////////////////
// RxPdf
///////////////////////////////////////////////////////////
export interface RxPdfData {
  prescriptions: {
    name: string;
    ingredients: string[];
    frequency: string;
    instructions?: string;
  }[];
  generalAdvice: CaseSheetOtherInstruction[];
  diagnoses: CaseSheetDiagnosis[];
  doctorInfo: {
    salutation: string;
    firstName: string;
    lastName: string;
    qualifications: string;
    registrationNumber: string;
    specialty: string;
    signature: string;
  };
  hospitalAddress: {
    name: string;
    streetLine1: string;
    streetLine2: string;
    city: string;
    zipcode: string;
    state: string;
    country: string;
  };
  patientInfo: {
    firstName: string;
    lastName: string;
    gender: string;
    uhid: string;
    age: string;
  };
  vitals: { height: string; weight: string; temperature: string; bp: string };
  appointmentDetails: { displayId: string; consultDate: string; consultType: string };
  diagnosesTests: CaseSheetDiagnosisPrescription[];
  caseSheetSymptoms: CaseSheetSymptom[];
  followUpDetails: string;
}
///////////////////////////////////////////////////////////
