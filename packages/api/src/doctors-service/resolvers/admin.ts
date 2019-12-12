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
} from 'doctors-service/entities';
import {
  AdminDoctor,
  AdminUser,
  AdminFacility,
  AdminDoctorAndHospital,
  AdminDoctorSecretaryRepository,
  AdminSecretaryRepository,
} from 'doctors-service/repositories/adminRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { isMobileNumberValid, isNameValid, trimObjects } from '@aph/universal/dist/aphValidators';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { ApiConstants } from 'ApiConstants';

export const AdminTypeDefs = gql`
  input DoctorInput {
    awards: String
    city: String
    consultBuffer: Int!
    consultDuration: Int!
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
  //input validation ends

  const doctorDetails: Partial<Doctor> = {
    ...doctorInputdata,
  };

  //specilaty check
  const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const specialty = await specialtyRepo.findById(doctorInputdata.specialtyId.toString());
  if (specialty == null) throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR);
  if (specialty) doctorDetails.specialty = specialty;

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
  await doctorAndHospitalRepo.createDoctorAndHospital(doctorAndHospital);

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
  return newDoctorDetails;
};

export const AdminResolvers = {
  Query: {
    adminGetDoctorsList,
  },
  Mutation: {
    createDoctor,
  },
};
