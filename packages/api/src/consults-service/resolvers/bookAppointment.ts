import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { Appointment, STATUS, APPOINTMENT_TYPE, CaseSheet } from 'consults-service/entities';
import { ConsultServiceContext } from 'consults-service/consultServiceContext';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';
import { AphMqClient, AphMqMessage, AphMqMessageTypes } from 'AphMqClient';
import { AppointmentPayload } from 'types/appointmentTypes';
import { addMinutes, format } from 'date-fns';
import { CaseSheetRepository } from 'consults-service/repositories/caseSheetRepository';

export const bookAppointmentTypeDefs = gql`
  enum STATUS {
    IN_PROGRESS
    CONFIRMED
    CANCELLED
    COMPLETED
    PENDING
    NO_SHOW
  }

  enum APPOINTMENT_TYPE {
    ONLINE
    PHYSICAL
  }

  type AppointmentBooking {
    id: ID!
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
    status: STATUS!
  }

  input BookAppointmentInput {
    patientId: ID!
    doctorId: ID!
    appointmentDateTime: DateTime!
    appointmentType: APPOINTMENT_TYPE!
    hospitalId: ID
  }

  type BookAppointmentResult {
    appointment: AppointmentBooking
  }

  extend type Mutation {
    bookAppointment(appointmentInput: BookAppointmentInput): BookAppointmentResult!
  }
`;

type BookAppointmentResult = {
  appointment: Appointment;
};

type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
};

type AppointmentBooking = {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDateTime: Date;
  appointmentType: APPOINTMENT_TYPE;
  hospitalId?: string;
  status: STATUS;
};

type AppointmentInputArgs = { appointmentInput: BookAppointmentInput };

const bookAppointment: Resolver<
  null,
  AppointmentInputArgs,
  ConsultServiceContext,
  BookAppointmentResult
> = async (parent, { appointmentInput }, { consultsDb, doctorsDb }) => {
  const appointmentAttrs: Omit<AppointmentBooking, 'id'> = {
    ...appointmentInput,
    status: STATUS.PENDING,
  };

  //check if docotr id is valid
  const doctor = doctorsDb.getCustomRepository(DoctorRepository);
  const docDetails = await doctor.findById(appointmentInput.doctorId);
  if (!docDetails) {
    throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
  }

  //check if docotr and hospital are matched
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
  const appointment = await appts.saveAppointment(appointmentAttrs);
  //message queue starts
  const doctorName = docDetails.salutation + ' ' + docDetails.firstName + '' + docDetails.lastName;
  const speciality = docDetails.specialty.name;
  const aptEndTime = addMinutes(appointmentInput.appointmentDateTime, 15);
  const slotTime =
    format(appointmentInput.appointmentDateTime, 'hh:mm') + '-' + format(aptEndTime, 'hh:mm');
  const patientDob: string = '01/08/1996';

  const payload: AppointmentPayload = {
    appointmentDate: format(appointmentInput.appointmentDateTime, 'dd/MM/yyyy'),
    appointmentTypeId: 1,
    askApolloReferenceIdForRelation: '52478bae-fab8-49ba-8f75-fce0e1a9f3ae',
    askApolloReferenceIdForSelf: '52478bae-fab8-49ba-8f75-fce0e1a9f3ae',
    cityId: 1,
    cityName: 'Chennai',
    dateOfBirth: patientDob,
    doctorId: 100,
    doctorName,
    gender: '1',
    hospitalId: '2',
    hospitalName: 'Apollo Hospitals Greams Road Chennai',
    leadSource: 'One Apollo-IOS',
    patientEmailId: 'sriram.kanchan@popcornapps.com', //patientDetails.emailAddress,
    patientFirstName: 'sriram', //patientDetails.firstName,
    patientLastName: 'kumar', //patientDetails.lastName,
    patientMobileNo: '8019677178', //patientDetails.mobileNumber,
    patientUHID: '',
    relationTypeId: 1,
    salutation: 1,
    slotId: '-1',
    slotTime,
    speciality,
    specialityId: '1898',
    userFirstName: 'sriram', //patientDetails.firstName,patientDetails.firstName,
    userLastName: 'sriram', //patientDetails.firstName,patientDetails.lastName,
  };
  AphMqClient.connect();
  type TestMessage = AphMqMessage<AphMqMessageTypes.BOOKAPPOINTMENT, AppointmentPayload>;
  const testMessage: TestMessage = {
    type: AphMqMessageTypes.BOOKAPPOINTMENT,
    payload,
  };

  console.log('sending message', testMessage);
  AphMqClient.send(testMessage);
  //message queue ends

  //TODO after junior doctor flow.. casesheet creation should be changed.
  const caseSheetRepo = consultsDb.getCustomRepository(CaseSheetRepository);
  const caseSheetAttrs: Partial<CaseSheet> = {
    consultType: appointment.appointmentType,
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    appointment: appointment,
  };
  await caseSheetRepo.savecaseSheet(caseSheetAttrs);
  ///////////

  return { appointment };
};

export const bookAppointmentResolvers = {
  Mutation: {
    bookAppointment,
  },
};
