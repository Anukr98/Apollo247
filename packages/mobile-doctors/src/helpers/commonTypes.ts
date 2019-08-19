import { GetDoctorDetails_getDoctorDetails } from '@aph/mobile-doctors/src/graphql/types/GetDoctorDetails';

// Once user goes to Login screen, change isOnboardingDone to true
// Once user completes profile flow, change isProfileFlowDone to true
// Set isLoggedIn to true when otp verification is done
// Set isLoggedIn & isProfileFlowDone to false before logging out
export type LocalStorage = {
  isProfileFlowDone?: boolean;
  isOnboardingDone?: boolean;
  doctorDetails: GetDoctorDetails_getDoctorDetails | null;
};

export type TimeOutData = {
  phoneNumber: string;
  startTime: string;
  invalidAttems: number;
};

export type PatientInfoData = {
  firstName: string;
  gender: string;
  uhid: string;
};

export type DummyQueryResult = {
  error: string | null;
  loading: boolean;
  data: {
    getDoctorProfile?: DoctorProfile;
    getDoctorProfileById?: DoctorProfile;
    getDoctors?: DoctorProfile[];
    getDoctorsForStarDoctorProgram?(searchString: string): Promise<DoctorProfile[]>;
  };
};

export type DoctorProfile = {
  profile: Doctor;
  paymentDetails: PaymentDetails[];
  clinics: clinics[];
  starDoctorTeam: Doctor[];
  consultationHours: Consultations[];
  appointments: Appointments[];
};

export type Doctor = {
  id: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  experience: string;
  speciality: string;
  specialization: string;
  isStarDoctor: boolean;
  education: string;
  services: string;
  languages: string;
  city: string;
  awards: string;
  photoUrl: string;
  registrationNumber: string;
  isProfileComplete: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  onlineConsultationFees: string;
  physicalConsultationFees: string;
  package: string;
  typeOfConsult: string;
  inviteStatus: string;
  // Should-add-to-backend
  ifscCode: string;
  accountType: string;
};
export type PaymentDetails = {
  accountNumber: string;
  address: string;
};
export type clinics = {
  name: string;
  location: string;
};
export type Consultations = {
  days: string;
  startTime: string;
  endTime: string;
  availableForPhysicalConsultation: boolean;
  availableForVirtualConsultation: boolean;
  type: string; //=> 'accepted' | 'Not accepted'
};

export type Appointments = {
  doctorname: string;
  timings: string;
  disease: string;
  wayOfContact: 'audio' | 'video';
  timeslottype: 'past' | 'missed' | 'up-next' | 'next'; //=> 'MISSED' | 'UP NEXT'
};
