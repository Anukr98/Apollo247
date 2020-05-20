import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import {
  STATUS,
  APPOINTMENT_TYPE,
  APPOINTMENT_STATE,
  BOOKINGSOURCE,
  DEVICETYPE,
  PATIENT_TYPE,
} from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
//import { addMinutes, format, addMilliseconds } from 'date-fns';
import { BlockedCalendarItemRepository } from 'doctors-service/repositories/blockedCalendarItemRepository';
import { CouponRepository } from 'profiles-service/repositories/couponRepository';
import { discountCalculation } from 'helpers/couponCommonFunctions';

export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
    COMPLETED
    PENDING
    PAYMENT_PENDING
    PAYMENT_FAILED
    PAYMENT_PENDING_PG
    NO_SHOW
    JUNIOR_DOCTOR_STARTED
    JUNIOR_DOCTOR_ENDED
    CALL_ABANDON
    UNAVAILABLE_MEDMANTRA
  }

  enum APPOINTMENT_TYPE {
    ONLINE
    PHYSICAL
    BOTH
  }

  enum BOOKINGSOURCE {
    MOBILE
    WEB
  }

  enum DEVICETYPE {
    IOS
    ANDROID
    DESKTOP
  }

  type AppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID!
    status: STATUS!
    patientName: String!
    appointmentState: APPOINTMENT_STATE!
  }

  type AppointmentBookingResult {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID!
    status: STATUS!
    patientName: String!
    appointmentState: APPOINTMENT_STATE!
    displayId: Int!
  }

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID!
    symptoms: String
    bookingSource: BOOKINGSOURCE
    deviceType: DEVICETYPE
    couponCode: String
  }

  type BookAppointmentResult {
    appointment: AppointmentBookingResult
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  appointment: AppointmentBookingResult;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  symptoms?: string;
  bookingSource?: BOOKINGSOURCE;
  deviceType?: DEVICETYPE;
  couponCode: string;
  actualAmount: number;
  discountedAmount: number;
};

type AppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  status: STATUS;
  patientName: string;
  appointmentState: APPOINTMENT_STATE;
};

type AppointmentBookingResult = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId: string;
  status: STATUS;
  patientName: string;
  appointmentState: APPOINTMENT_STATE;
  displayId: number;
};

type AppointmentInputArgs = { appointmentInput: BookAppointmentInput };
enum CONSULTFLAG {
  OUTOFCONSULTHOURS = 'OUTOFCONSULTHOURS',
  OUTOFBUFFERTIME = 'OUTOFBUFFERTIME',
  INCONSULTHOURS = 'INCONSULTHOURS',
}

const bookAppointment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }, { consultsDb, doctorsDb, patientsDb }) => {
  //check if patient id is valid
  const patient = patientsDb.getCustomRepository(PatientRepository);
  const patientDetails = await patient.findById(appointmentInput.patientId);
  if (!patientDetails) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
  }

  /*if (patientDetails.dateOfBirth == null || !patientDetails.dateOfBirth) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }

  if (patientDetails.lastName == null || !patientDetails.lastName) {
    throw new AphError(AphErrorMessages.INVALID_PATIENT_DETAILS, undefined, {});
  }*/

  //check if doctor id is valid
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(appointmentInput.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if doctor is junior doctor
  const isJunior = await doctor.isJuniorDoctor(appointmentInput.doctorId);
  if (isJunior) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }
  // check if hospital id is linked to doctor
  let facilityFlag = 0;
  docDetails.doctorHospital.forEach((facility) => {
    if (facility.facility.id == appointmentInput.hospitalId) {
      facilityFlag = 1;
    }
  });

  if (facilityFlag == 0) {
    throw new AphError(AphErrorMessages.INVALID_HOSPITAL_ID, undefined, {});
  }

  // if (docDetails.doctorHospital[0].facility.id !== appointmentInput.hospitalId) {
  //   throw new AphError(AphErrorMessages.INVALID_HOSPITAL_ID, undefined, {});
  // }

  //check if doctor and hospital are matched
  const facilityId = appointmentInput.hospitalId;
  if (facilityId) {
    const doctorHospRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
    const docHospital = await doctorHospRepo.findDoctorHospital(
      appointmentInput.doctorId,
      facilityId
    );
    if (!docHospital) {
      throw new AphError(AphErrorMessages.INVALID_FACILITY_ID, undefined, {});
    }
  }

  //check if doctor slot is blocked
  const blockRepo = doctorsDb.getCustomRepository(BlockedCalendarItemRepository);
  const slotDetails = await blockRepo.checkIfSlotBlocked(
    appointmentInput.appointmentDateTime,
    appointmentInput.doctorId
  );
  if (
    slotDetails[0] &&
    (slotDetails[0].consultMode === APPOINTMENT_TYPE.BOTH.toString() ||
      slotDetails[0].consultMode === appointmentInput.appointmentType.toString())
  ) {
    throw new AphError(AphErrorMessages.DOCTOR_SLOT_BLOCKED, undefined, {});
  }

  //check if given appointment datetime is greater than current date time
  if (appointmentInput.appointmentDateTime <= new Date()) {
    throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  }

  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptCount = await appts.checkIfAppointmentExist(
    appointmentInput.doctorId,
    appointmentInput.appointmentDateTime
  );

  if (apptCount > 0) {
    throw new AphError(AphErrorMessages.APPOINTMENT_EXIST_ERROR, undefined, {});
  }

  const patientConsults = await appts.checkPatientConsults(
    appointmentInput.patientId,
    appointmentInput.appointmentDateTime
  );
  if (patientConsults) {
    throw new AphError(AphErrorMessages.ANOTHER_DOCTOR_APPOINTMENT_EXIST, undefined, {});
  }

  const checkHours = await appts.checkWithinConsultHours(
    appointmentInput.appointmentDateTime,
    appointmentInput.appointmentType,
    appointmentInput.doctorId,
    doctorsDb,
    appointmentInput.hospitalId
  );

  // if (checkHours === CONSULTFLAG.OUTOFBUFFERTIME) {
  //   throw new AphError(AphErrorMessages.APPOINTMENT_BOOK_DATE_ERROR, undefined, {});
  // }

  if (checkHours === CONSULTFLAG.OUTOFCONSULTHOURS) {
    throw new AphError(AphErrorMessages.OUT_OF_CONSULT_HOURS, undefined, {});
  }

  // check if patient cancelled appointment for more than 3 times in a week

  const apptsrepo = consultsDb.getCustomRepository(AppointmentRepository);
  const cancelledCount = await apptsrepo.checkPatientCancelledHistory(
    appointmentInput.patientId,
    appointmentInput.doctorId
  );
  if (cancelledCount >= 3) {
    throw new AphError(AphErrorMessages.BOOKING_LIMIT_EXCEEDED, undefined, {});
  }

  const appointmentDetails = await apptsrepo.getAppointmentsByDocId(appointmentInput.doctorId);
  let prevPatientId = '0';
  if (appointmentDetails.length) {
    appointmentDetails.forEach(async (appointmentData) => {
      if (appointmentData.patientId != prevPatientId) {
        prevPatientId = appointmentData.patientId;
        await apptsrepo.updatePatientType(appointmentData, PATIENT_TYPE.NEW);
      } else {
        await apptsrepo.updatePatientType(appointmentData, PATIENT_TYPE.REPEAT);
      }
    });
  }

  //calculate coupon discount value
  if (appointmentInput.couponCode) {
    const couponRepo = patientsDb.getCustomRepository(CouponRepository);
    const couponData = await couponRepo.findCouponByCode(appointmentInput.couponCode);
    if (couponData == null) throw new AphError(AphErrorMessages.INVALID_COUPON_CODE);

    let doctorFees = 0;
    if (appointmentInput.appointmentType === APPOINTMENT_TYPE.ONLINE)
      doctorFees = <number>docDetails.onlineConsultationFees;
    else doctorFees = <number>docDetails.physicalConsultationFees;
    const couponGenericRulesData = couponData.couponGenericRule;

    if (couponGenericRulesData.discountType && couponGenericRulesData.discountValue >= 0) {
      appointmentInput.actualAmount = doctorFees;
      appointmentInput.discountedAmount = await discountCalculation(
        doctorFees,
        couponGenericRulesData.discountType,
        couponGenericRulesData.discountValue
      );
    }
  } else {
    let doctorFees = 0;
    if (appointmentInput.appointmentType === APPOINTMENT_TYPE.ONLINE)
      doctorFees = <number>docDetails.onlineConsultationFees;
    else doctorFees = <number>docDetails.physicalConsultationFees;

    appointmentInput.discountedAmount = doctorFees;
    appointmentInput.actualAmount = doctorFees;
  }

  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.PAYMENT_PENDING,
    patientName: patientDetails.firstName + ' ' + patientDetails.lastName,
    appointmentDateTime: new Date(appointmentInput.appointmentDateTime.toISOString()),
    appointmentState: APPOINTMENT_STATE.NEW,
  };
  const appointment = await appts.saveAppointment(appointmentAttrs);

  return { appointment };
};

// const bookMedMantraAppointment = async (
//   apptDetails: Appointment,
//   consultsDb: Connection,
//   doctorsDb: Connection,
//   patientsDb: Connection
// ) => {
//   //get appointment doctor details
//   const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
//   const doctorDetails = await doctorRepo.findById(apptDetails.doctorId);
//   if (!doctorDetails) throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});

//   const apptsRepo = consultsDb.getCustomRepository(AppointmentRepository);
//   const bookingResponse = await apptsRepo.bookMedMantraAppointment(
//     apptDetails,
//     doctorDetails,
//     patientsDb,
//     doctorsDb
//   );
//   return bookingResponse;
// };

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
