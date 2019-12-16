import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  Doctor,
  DoctorType,
  Salutation,
  Gender,
  DoctorAndHospital,
  DoctorSecretary,
  ConsultHoursData,
  ConsultHours,
  ConsultType,
} from 'doctors-service/entities';
import {
  AdminDoctor,
  AdminUser,
  AdminFacility,
  AdminDoctorAndHospital,
  AdminDoctorSecretaryRepository,
  AdminSecretaryRepository,
  AdminConsultHoursRepository,
} from 'doctors-service/repositories/adminRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { isMobileNumberValid, isNameValid, trimObjects } from '@aph/universal/dist/aphValidators';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { ApiConstants } from 'ApiConstants';
import format from 'date-fns/format';
import { areIntervalsOverlapping, isEqual, isAfter } from 'date-fns';
import { setWeekWithOptions } from 'date-fns/esm/fp';
import _ from 'lodash';

export const AdminTypeDefs = gql`
  input ConsultHoursData {
    weekDay: WeekDay
    startTime: Time
    endTime: Time
    consultMode: ConsultMode
  }

  input DoctorInput {
    awards: String
    city: String
    consultBuffer: Int!
    consultDuration: Int!
    consultHoursData: [ConsultHoursData]
    country: String
    dateOfBirth: Date
    doctorType: DoctorType!
    displayName: String!
    emailAddress: String
    facilityId: String!
    fullName: String!
    experience: Int
    firstName: String!
    gender: Gender!
    lastName: String!
    languages: String
    middleName: String
    mobileNumber: String!
    onlineConsultationFees: Int!
    photoUrl: String
    physicalConsultationFees: Int!
    qualification: String
    registrationNumber: String
    salutation: Salutation
    secretaryId: String
    specialtyId: String
    specialization: String
    state: String
    streetLine1: String
    streetLine2: String
    streetLine3: String
    thumbnailUrl: String
    zip: String
  }

  extend type Query {
    adminGetDoctorsList(offset: Int!, limit: Int!): [DoctorDetails]
  }

  extend type Mutation {
    createDoctor(doctorInputdata: DoctorInput): DoctorDetails
  }
`;
const adminGetDoctorsList: Resolver<
  null,
  { offset: number; limit: number },
  DoctorsServiceContext,
  Doctor[]
> = async (parent, args, { doctorsDb, currentUser, mobileNumber }) => {
  const doctorRepository = doctorsDb.getCustomRepository(AdminDoctor);
  const adminUserRepo = doctorsDb.getCustomRepository(AdminUser);

  const accessDetails = await adminUserRepo.checkValidAccess(mobileNumber, true);
  if (accessDetails == null) throw new AphError(AphErrorMessages.UNAUTHORIZED);

  const doctorsData = await doctorRepository.getAllDoctors(args.offset, args.limit);
  if (doctorsData == null) throw new AphError(AphErrorMessages.GET_DOCTORS_ERROR);
  return doctorsData;
};

type DoctorInput = {
  awards: string;
  city: string;
  consultBuffer: number;
  consultDuration: number;
  consultHoursData: ConsultHoursData[];
  country: string;
  dateOfBirth: Date;
  doctorType: DoctorType;
  displayName: string;
  emailAddress: string;
  facilityId: DoctorAndHospital;
  fullName: string;
  experience: Number;
  firstName: string;
  gender: Gender;
  languages: string;
  lastName: string;
  middleName: string;
  mobileNumber: string;
  onlineConsultationFees: Number;
  photoUrl: string;
  physicalConsultationFees: Number;
  qualification: string;
  registrationNumber: string;
  salutation: Salutation;
  secretaryId: string;
  specialtyId: string;
  specialization: string;
  state: string;
  streetLine1: string;
  streetLine2: string;
  streetLine3: string;
  thumbnailUrl: string;
  zip: string;
};

type DoctorInputArgs = { doctorInputdata: DoctorInput };

const createDoctor: Resolver<null, DoctorInputArgs, DoctorsServiceContext, Doctor> = async (
  parent,
  { doctorInputdata },
  { doctorsDb, currentUser, mobileNumber }
) => {
  doctorInputdata = trimObjects(doctorInputdata);

  //input validations starts
  if (!isNameValid(doctorInputdata.firstName))
    throw new AphError(AphErrorMessages.INVALID_FIRST_NAME);
  if (!isNameValid(doctorInputdata.lastName))
    throw new AphError(AphErrorMessages.INVALID_LAST_NAME);
  if (!isNameValid(doctorInputdata.fullName))
    throw new AphError(AphErrorMessages.INVALID_FULL_NAME);
  if (!isNameValid(doctorInputdata.displayName))
    throw new AphError(AphErrorMessages.INVALID_DISPLAY_NAME);
  if (!isMobileNumberValid(doctorInputdata.mobileNumber))
    throw new AphError(AphErrorMessages.INVALID_MOBILE_NUMBER);

  if (!doctorInputdata.facilityId) throw new AphError(AphErrorMessages.INVALID_FACILITY_ID);
  if (!doctorInputdata.consultHoursData) throw new AphError(AphErrorMessages.INVALID_CONSULT_HOURS);

  const uniqueCalendarItems = _.uniqWith(
    doctorInputdata.consultHoursData,
    (item1, item2) =>
      isEqual(new Date(item1.startTime), new Date(item2.startTime)) &&
      isEqual(new Date(item1.endTime), new Date(item2.endTime)) &&
      item1.consultMode === item2.consultMode &&
      item1.weekDay === item2.weekDay
  );

  if (uniqueCalendarItems.length != doctorInputdata.consultHoursData.length)
    throw new AphError(AphErrorMessages.INVALID_DATES);

  const exceptions = await checkOverlapsAndException(0, 0, doctorInputdata.consultHoursData);

  if (exceptions.dateException > 0 || exceptions.overlapCount > 0) {
    throw new AphError(AphErrorMessages.INVALID_DATES);
  }

  //input validation ends

  const doctorDetails: Partial<Doctor> = { ...doctorInputdata };

  //specilaty check
  if (doctorInputdata.specialtyId && doctorInputdata.specialtyId.length > 0) {
    const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    const specialty = await specialtyRepo.findById(doctorInputdata.specialtyId.toString());
    if (specialty == null) throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR);
    if (specialty) doctorDetails.specialty = specialty;
  }

  //facility Id check
  const facilityRepo = doctorsDb.getCustomRepository(AdminFacility);
  const facility = await facilityRepo.findById(doctorInputdata.facilityId.toString());
  if (facility == null) throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR);

  const doctorRepository = doctorsDb.getCustomRepository(AdminDoctor);
  const isDoctorExist = await doctorRepository.searchByMobileNumber(doctorInputdata.mobileNumber);
  //if doctor is active throw error
  if (isDoctorExist && isDoctorExist.isActive)
    throw new AphError(AphErrorMessages.DOCTOR_ALREADY_EXISTS);

  //if doctor is in active, make them active & update the details
  if (isDoctorExist && !isDoctorExist.isActive) {
    doctorDetails.id = isDoctorExist.id;
    doctorDetails.isActive = true;
  }

  //placeholder image check
  if (doctorInputdata.photoUrl) {
    doctorDetails.photoUrl = ApiConstants.DOCTOR_DEFAULT_PHOTO_URL;
  }

  //placeholder image check
  if (doctorInputdata.thumbnailUrl) {
    doctorDetails.thumbnailUrl = ApiConstants.DOCTOR_DEFAULT_PHOTO_URL;
  }

  //insert in to doctor table
  const newDoctorDetails = await doctorRepository.createDoctor(doctorDetails);

  //insert in to doctorHospital
  const doctorAndHospital = {
    doctor: newDoctorDetails,
    facility: facility,
  };
  const doctorAndHospitalRepo = doctorsDb.getCustomRepository(AdminDoctorAndHospital);
  const doctorHospital = await doctorAndHospitalRepo.createDoctorAndHospital(doctorAndHospital);

  if (doctorInputdata.secretaryId) {
    //check if secretary id is valid
    const secretaryRepo = doctorsDb.getCustomRepository(AdminSecretaryRepository);
    const secretaryDetails = await secretaryRepo.getSecretaryById(doctorInputdata.secretaryId);
    if (secretaryDetails == null) throw new AphError(AphErrorMessages.INVALID_SECRETARY_ID);

    //check for doctor secretary
    const doctorSecretaryRepo = doctorsDb.getCustomRepository(AdminDoctorSecretaryRepository);
    const doctorSecretaryRecord = await doctorSecretaryRepo.findRecord(
      newDoctorDetails.id,
      doctorInputdata.secretaryId
    );
    if (doctorSecretaryRecord)
      throw new AphError(AphErrorMessages.SECRETARY_DOCTOR_COMBINATION_EXIST);

    //insert DoctorSecretary record
    const doctorSecretaryDetails: Partial<DoctorSecretary> = {
      secretary: secretaryDetails,
      doctor: newDoctorDetails,
    };
    await doctorSecretaryRepo.saveDoctorSecretary(doctorSecretaryDetails);
  }

  //insert in to consult hours
  const doctorConsultHours: Partial<ConsultHours>[] = [];
  doctorInputdata.consultHoursData.forEach((element) => {
    doctorConsultHours.push({
      doctor: newDoctorDetails,
      doctorHospital: doctorHospital,
      facility: facility,
      consultMode: element.consultMode,
      consultType: ConsultType.FIXED,
      startTime: format(new Date(element.startTime), 'HH:mm'),
      endTime: format(new Date(element.endTime), 'HH:mm'),
      weekDay: element.weekDay,
    });
  });
  const consultHoursRepo = doctorsDb.getCustomRepository(AdminConsultHoursRepository);
  await consultHoursRepo.save(doctorConsultHours);

  return newDoctorDetails;
};

export const checkOverlapsAndException = async (
  overlapCount: number,
  dateException: number,
  consultHoursData: Partial<ConsultHours>[]
) => {
  let currentIndex = 0;
  return new Promise<{ overlapCount: number; dateException: number }>(async (resolve, reject) => {
    consultHoursData.forEach(async (item, index) => {
      if (item.startTime && item.endTime) {
        const start = item.startTime;
        const end = item.endTime;
        const itemsList = consultHoursData.filter((currentObject, currentIndex) => {
          return currentIndex != index;
        });

        if (isEqual(new Date(start), new Date(end))) {
          dateException++;
          resolve({ overlapCount, dateException });
        }
        if (isAfter(new Date(start), new Date(end))) {
          dateException++;
          resolve({ overlapCount, dateException });
        }

        const calendarItemsOverlap = doesCalendarItemOverlap(item, itemsList);
        if (calendarItemsOverlap) {
          overlapCount++;
          resolve({ overlapCount, dateException });
        }

        const consultMode = item.consultMode;
        currentIndex++;
        if (currentIndex == consultHoursData.length) resolve({ overlapCount, dateException });
      }
    });
  });
};

export const doesCalendarItemOverlap = (
  item: Partial<ConsultHours>,
  itemsToCheckAgainst: Partial<ConsultHours>[]
) => {
  return itemsToCheckAgainst.some(({ startTime, endTime }) => {
    const convertedStartTime = new Date(startTime!);
    const convertedEndTime = new Date(endTime!);
    const convertedStartTime2 = new Date(item.startTime!);
    const convertedEndTime2 = new Date(item.endTime!);

    try {
      return areIntervalsOverlapping(
        { start: convertedStartTime, end: convertedEndTime },
        { start: convertedStartTime2, end: convertedEndTime2 }
      );
    } catch (Exception) {
      return true;
    }
  });
};

export const AdminResolvers = {
  Query: {
    adminGetDoctorsList,
  },
  Mutation: {
    createDoctor,
  },
};
