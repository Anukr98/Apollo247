import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { DOCTOR_ONLINE_STATUS, Salutation, DoctorType } from 'graphql/types/globalTypes';

type Doctor = GetDoctorDetails_getDoctorDetails;

export const jrKabir: Doctor = {
  __typename: 'DoctorDetails',
  awards: null,
  city: null,
  country: null,
  dateOfBirth: null,
  doctorType: DoctorType.JUNIOR,
  delegateNumber: null,
  emailAddress: null,
  experience: null,
  firebaseToken: null,
  firstName: 'Kabir',
  isActive: true,
  id: '1',
  languages: null,
  lastName: 'Sarin',
  mobileNumber: '+919296858696',
  onlineConsultationFees: '500',
  onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
  photoUrl: null,
  physicalConsultationFees: '200',
  qualification: null,
  registrationNumber: '123456',
  salutation: Salutation.DR,
  specialization: null,
  state: null,
  streetLine1: null,
  streetLine2: null,
  streetLine3: null,
  zip: null,
  consultHours: null,
  packages: null,
  bankAccount: null,
  specialty: {
    __typename: 'DoctorSpecialties',
    name: 'Codez',
  },
  doctorHospital: [],
  starTeam: null,
};

export const srKabir = {
  ...jrKabir,
  doctorType: DoctorType.APOLLO,
};
