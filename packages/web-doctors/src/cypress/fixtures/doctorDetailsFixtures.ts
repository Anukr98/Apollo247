import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { DOCTOR_ONLINE_STATUS, Salutation, DoctorType } from 'graphql/types/globalTypes';

type Doctor = GetDoctorDetails_getDoctorDetails;

export const jrKabir: Doctor = {
  __typename: 'DoctorDetails',
  awards: '',
  city: '',
  country: '',
  dateOfBirth: '',
  doctorType: DoctorType.JUNIOR,
  delegateNumber: '',
  emailAddress: '',
  experience: '',
  firebaseToken: '',
  firstName: 'Kabir',
  isActive: true,
  id: '1',
  languages: 'Typescript, Javascript, Ruby, Python, C, GraphQL',
  lastName: 'Sarin',
  mobileNumber: '+919296858696',
  onlineConsultationFees: '500',
  onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
  photoUrl: '',
  physicalConsultationFees: '200',
  qualification: '',
  registrationNumber: '123456',
  salutation: Salutation.DR,
  specialization: '',
  state: '',
  streetLine1: '',
  streetLine2: '',
  streetLine3: '',
  zip: '',
  consultHours: [],
  packages: [],
  bankAccount: null,
  specialty: {
    __typename: 'DoctorSpecialties',
    name: 'Codez',
  },
  doctorHospital: [],
  starTeam: [],
};

export const srKabir = {
  ...jrKabir,
  doctorType: DoctorType.APOLLO,
};
