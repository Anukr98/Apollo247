import { GetDoctorDetails_getDoctorDetails } from 'graphql/types/GetDoctorDetails';
import { DOCTOR_ONLINE_STATUS, Salutation, DoctorType, Gender } from 'graphql/types/globalTypes';

type Doctor = GetDoctorDetails_getDoctorDetails;

export const jrKabir: Doctor = {
  __typename: 'DoctorDetails',
  id: 'befa91a6-adb0-488d-a148-cc84ce3cacac',
  firstName: 'Kabir',
  lastName: 'Sarin',
  emailAddress: 'kabir@sarink.net',
  doctorType: DoctorType.JUNIOR,
  // mobileNumber: '+919999999999', // OTP is 999999
  mobileNumber: '+919296858696', // OTP is 772345
  delegateNumber: '+91123456789',
  isActive: true, // Don't forget to set this to true or you won't be able to log in!
  onlineStatus: DOCTOR_ONLINE_STATUS.ONLINE,
  // firebaseToken: 'dJYFTV7MJGWK2EdziTtr5zUPm243', // This is actually the firebaseuid, not the token
  firebaseToken: 'gnUQsiiGlrS0NuGgF62RsmvG1HF3',

  awards: '',
  city: '',
  country: '',
  dateOfBirth: '',
  experience: '',
  languages: 'Typescript, Javascript, Ruby, Python, C, GraphQL',
  onlineConsultationFees: '500',
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
