// Once user goes to Login screen, change isOnboardingDone to true
// Once user completes profile flow, change isProfileFlowDone to true
// Set isLoggedIn to true when otp verification is done
// Set isLoggedIn & isProfileFlowDone to false before logging out
export type LocalStorage = {
  isLoggedIn?: boolean;
  isProfileFlowDone?: boolean;
  isOnboardingDone?: boolean;
};

export type DummyQueryResult = {
  error: any;
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
  type: string; //=> 'MISSED' | 'UP NEXT'
  timeslottype: string;
};
