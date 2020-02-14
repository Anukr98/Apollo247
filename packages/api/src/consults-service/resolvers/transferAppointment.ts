import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  Appointment,
  TRANSFER_STATUS,
  STATUS,
  APPOINTMENT_TYPE,
  APPOINTMENT_STATE,
  TRANSFER_INITIATED_TYPE,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { TransferAppointmentRepository } from 'consults-service/repositories/tranferAppointmentRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
//import { SendNotification } from 'consults-service/sendNotifications';
//import { MailMessage } from 'types/notificationMessageTypes';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { addDays } from 'date-fns';
import { NotificationType, sendNotification } from 'notifications-service/resolvers/notifications';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

export const transferAppointmentTypeDefs = gql`
  enum TRANSFER_STATUS {
    INITIATED
    COMPLETED
    REJECTED
  }

  enum TRANSFER_INITIATED_TYPE {
    DOCTOR
    PATIENT
  }

  enum APPOINTMENT_STATE {
    NEW
    TRANSFER
    RESCHEDULE
    AWAITING_TRANSFER
    AWAITING_RESCHEDULE
    TRANSFERRED
  }

  type TransferAppointment {
    id: ID!
    appointmentId: ID!
    transferStatus: TRANSFER_STATUS!
    transferReason: String!
    transferredDoctorId: String
    transferredSpecialtyId: String
    transferNotes: String
  }

  input TransferAppointmentInput {
    appointmentId: ID!
    transferReason: String!
    transferredDoctorId: String
    transferredSpecialtyId: String
    transferNotes: String
    transferInitiatedBy: TRANSFER_INITIATED_TYPE
    transferInitiatedId: String!
  }

  input BookTransferAppointmentInput {
    existingAppointmentId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    patientId: ID!
    transferId: ID!
  }

  type TransferAppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
    appointmentState: APPOINTMENT_STATE
    patientName: String!
    isTransfer: Int!
    transferParentId: String!
  }

  type TransferAppointmentResult {
    transferAppointment: TransferAppointment
    doctorNextSlot: String
  }

  type BookTransferAppointmentResult {
    appointment: TransferAppointmentBooking
  }
  extend type Mutation {
    initiateTransferAppointment(
      TransferAppointmentInput: TransferAppointmentInput
    ): TransferAppointmentResult!
    bookTransferAppointment(
      BookTransferAppointmentInput: BookTransferAppointmentInput
    ): BookTransferAppointmentResult!
  }
`;

type TransferAppointmentResult = {
  transferAppointment: TransferAppointment;
  doctorNextSlot: string;
};

type TransferAppointmentInput = {
  appointmentId: string;
  transferReason: string;
  transferredDoctorId: string;
  transferredSpecialtyId: string;
  transferNotes: string;
  transferInitiatedBy: TRANSFER_INITIATED_TYPE;
  transferInitiatedId: string;
};

type TransferAppointment = {
  id: string;
  appointment: Appointment;
  transferStatus: TRANSFER_STATUS;
  transferReason: string;
  transferredDoctorId: string;
  transferredSpecialtyId: string;
  transferNotes: string;
};

type BookTransferAppointmentInput = {
  existingAppointmentId: string;
  doctorId: string;
  appointmentDateTime: Date;
  patientId: string;
  transferId: string;
};

type TransferAppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  status: STATUS;
  appointmentState: APPOINTMENT_STATE;
  parentId: string;
  patientName: string;
  isTransfer: Boolean;
  transferParentId: string;
};

type BookTransferAppointmentResult = {
  appointment: TransferAppointmentBooking;
};

type TransferAppointmentInputInputArgs = { TransferAppointmentInput: TransferAppointmentInput };
type BookTransferAppointmentInputInputArgs = {
  BookTransferAppointmentInput: BookTransferAppointmentInput;
};

const bookTransferAppointment: Resolver<
  null,
  BookTransferAppointmentInputInputArgs,
  ConsultServiceContext,
  BookTransferAppointmentResult
> = async (parent, { BookTransferAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  //check if patient id is valid
  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.findById(BookTransferAppointmentInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  if (patientDetails.dateOfBirth == null || !patientDetails.dateOfBirth) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

  if (patientDetails.lastName == null || !patientDetails.lastName) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

  //check if docotr id is valid
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(BookTransferAppointmentInput.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const apptDetails = await appointmentRepo.findById(
    BookTransferAppointmentInput.existingAppointmentId
  );
  if (!apptDetails) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  //check if given appointment datetime is greater than current date time
  if (BookTransferAppointmentInput.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  //check if doctor slot is blocked
  const blockRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
  const slotDetails = await blockRepo.checkIfSlotBlocked(
    BookTransferAppointmentInput.appointmentDateTime,
    BookTransferAppointmentInput.doctorId
  );
  if (slotDetails[0]) {
    throw new AphError(AphErrorMessages.DOCTOR_SLOT_BLOCKED, undefined, {});
  }

  const apptCount = await appointmentRepo.checkIfAppointmentExist(
    BookTransferAppointmentInput.doctorId,
    BookTransferAppointmentInput.appointmentDateTime
  );
  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  const patientConsults = await appointmentRepo.checkPatientConsults(
    BookTransferAppointmentInput.patientId,
    BookTransferAppointmentInput.appointmentDateTime
  );
  if (patientConsults) {
    throw new AphError(AphErrorMessages.ANOTHER_DOCTOR_APPOINTMENT_EXIST, undefined, {});
  }
  //update exisiting appt, state to transferred
  await appointmentRepo.updateTransferState(
    BookTransferAppointmentInput.existingAppointmentId,
    APPOINTMENT_STATE.TRANSFERRED
  );

  //insert new appt booking
  const appointmentAttrs: Omit<TransferAppointmentBooking, 'id'> = {
    ...BookTransferAppointmentInput,
    status: STATUS.PENDING,
    appointmentType: APPOINTMENT_TYPE.ONLINE,
    hospitalId: '',
    appointmentState: APPOINTMENT_STATE.TRANSFER,
    parentId: apptDetails.id,
    appointmentDateTime: new Date(BookTransferAppointmentInput.appointmentDateTime.toISOString()),
    isTransfer: true,
    transferParentId: BookTransferAppointmentInput.existingAppointmentId,
    patientName: patientDetails.firstName + ' ' + patientDetails.lastName,
  };
  const appointment = await appointmentRepo.saveAppointment(appointmentAttrs);

  //copy parent case-sheet details
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetDetails = await caseSheetRepo.getCaseSheetByAppointmentId(
    BookTransferAppointmentInput.existingAppointmentId
  );
  if (caseSheetDetails != null) {
    caseSheetDetails.forEach(async (caseSheetRecord) => {
      const caseSheetRow = {
        ...caseSheetRecord,
        appointment,
      };
      delete caseSheetRow.id;
      await caseSheetRepo.savecaseSheet(caseSheetRow);
    });
  }
  //case-sheet copy ends

  //update initiate transfer to completed
  const transferApptRepo = consultsDb.getCustomRepository(TransferAppointmentRepository);
  await transferApptRepo.updateTransfer(
    BookTransferAppointmentInput.transferId,
    TRANSFER_STATUS.COMPLETED
  );
  return { appointment };
};

const initiateTransferAppointment: Resolver<
  null,
  TransferAppointmentInputInputArgs,
  ConsultServiceContext,
  TransferAppointmentResult
> = async (parent, { TransferAppointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  const appointmentRepo = consultsDb.getCustomRepository(AppointmentRepository);
  const appointment = await appointmentRepo.findById(TransferAppointmentInput.appointmentId);
  if (!appointment) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }
  if (
    appointment.status !== STATUS.PENDING &&
    appointment.status !== STATUS.CONFIRMED &&
    appointment.status !== STATUS.IN_PROGRESS
  ) {
    throw new AphError(AphErrorMessages.INVALID_APPOINTMENT_ID, undefined, {});
  }

  if (TransferAppointmentInput.transferredDoctorId !== '') {
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctorDetails = doctorRepo.findById(TransferAppointmentInput.transferredDoctorId);
    if (!doctorDetails) {
      throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
    }
  }
  const transferApptRepo = consultsDb.getCustomRepository(TransferAppointmentRepository);
  const transferCount = await transferApptRepo.checkTransfer(
    TransferAppointmentInput.appointmentId,
    TransferAppointmentInput.transferredDoctorId
  );

  if (transferCount > 0) {
    throw new AphError(AphErrorMessages.TRANSFER_APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  const transferAppointmentAttrs: Omit<TransferAppointment, 'id'> = {
    ...TransferAppointmentInput,
    transferStatus: TRANSFER_STATUS.INITIATED,
    appointment,
  };

  const transferAppointment = await transferApptRepo.saveTransfer(transferAppointmentAttrs);
  await appointmentRepo.updateTransferState(
    TransferAppointmentInput.appointmentId,
    APPOINTMENT_STATE.AWAITING_TRANSFER
  );
  let slot = '';
  let nextDate = new Date();
  while (true) {
    const nextSlot = await appointmentRepo.getDoctorNextSlotDate(
      TransferAppointmentInput.transferredDoctorId,
      nextDate,
      doctorsDb,
      'ONLINE',
      new Date()
    );
    if (nextSlot != '' && nextSlot != undefined) {
      slot = nextSlot;
      break;
    }
    nextDate = addDays(nextDate, 1);
  }

  // send notification
  const pushNotificationInput = {
    appointmentId: appointment.id,
    notificationType: NotificationType.INITIATE_TRANSFER,
  };
  const notificationResult = sendNotification(
    pushNotificationInput,
    patientsDb,
    consultsDb,
    doctorsDb
  );
  console.log(notificationResult, 'notificationResult');
  return { transferAppointment, doctorNextSlot: slot };
};

export const transferAppointmentResolvers = {
  Mutation: {
    initiateTransferAppointment,
    bookTransferAppointment,
  },
};
