import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  Doctor,
  DoctorType,
  Salutation,
  Gender,
  DoctorSpecialty,
  DoctorAndHospital,
} from 'doctors-service/entities';
import { AdminDoctor, AdminUser } from 'doctors-service/repositories/adminRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { isMobileNumberValid, isNameValid } from '@aph/universal/dist/aphValidators';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { DoctorHospitalRepository } from 'doctors-service/repositories/doctorHospitalRepository';

export const AdminTypeDefs = gql`
  input DoctorInput {
    awards: String
    dateOfBirth: Date
    doctorType: DoctorType!
    delegateName: String
    delegateNumber: String
    displayName: String!
    emailAddress: String
    facilityId: String
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
    specialtyId: String
    specialization: String
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
  dateOfBirth: Date;
  doctorType: DoctorType;
  delegateName: string;
  delegateNumber: string;
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
  specialty: DoctorSpecialty;
  specialization: string;
};

type DoctorInputArgs = { doctorInputdata: DoctorInput };

const createDoctor: Resolver<null, DoctorInputArgs, DoctorsServiceContext, Doctor> = async (
  parent,
  { doctorInputdata },
  { doctorsDb, currentUser, mobileNumber }
) => {
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

  //specilaty check
  const specialtyRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
  const specialty = await specialtyRepo.findById(doctorInputdata.specialty.toString());
  if (specialty == null) throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR);

  //facility Id check
  const facilityRepo = doctorsDb.getCustomRepository(DoctorHospitalRepository);
  const facility = await facilityRepo.findById(doctorInputdata.facilityId.toString());
  if (facility == null) throw new AphError(AphErrorMessages.GET_FACILITIES_ERROR);

  const doctorRepository = doctorsDb.getCustomRepository(AdminDoctor);
  const isDoctorExist = await doctorRepository.searchByMobileNumber(doctorInputdata.mobileNumber);
  if (isDoctorExist) throw new AphError(AphErrorMessages.DOCTOR_ALREADY_EXISTS);

  doctorInputdata.specialty = specialty;
  const newDoctorDetails = await doctorRepository.createDoctor(doctorInputdata);
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
