import {
  DoctorProfile,
  DummyQueryResult,
  Doctor,
} from '@aph/mobile-doctors/src/helpers/commonTypes';

export const doctorProfile: DummyQueryResult = {
  error: null,
  loading: false,
  data: {
    getDoctorProfile: {
      profile: {
        id: '1',
        firstName: 'Sujane',
        lastName: 'Smith',
        mobileNumber: '1234567890',
        experience: '7',
        speciality: 'Gynacology',
        specialization: '',
        isStarDoctor: true,
        education: 'MBBS',
        services: 'Consultations, Surgery',
        languages: 'English,Hindi,Telgu',
        city: 'Hyderabad',
        awards: 'Ramon Magsaysay Award',
        photoUrl: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
        registrationNumber: '123456',
        isProfileComplete: 'false',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '300',
        physicalConsultationFees: '300',
        package: '3 Online Consults + 3 Physical Consults @ Rs.999',
        typeOfConsult: '24/7',
        inviteStatus: 'Accepted',
        ifscCode: 'HDFC0002000',
        accountType: 'Savings Account',
      },
      paymentDetails: [
        {
          accountNumber: '1234 5678 5678 7890',
          address: 'State Bank of India, Powai',
        },
      ],
      clinics: [
        {
          name: 'Homeocare Hospital',
          location: 'Secunderbad',
        },
        {
          name: 'Gayathri Hospital',
          location: 'Madhapur',
        },
      ],
      starDoctorTeam: [
        {
          firstName: 'David',
          lastName: 'Mcmarrow',
          experience: '7',
          typeOfConsult: '24/7',
          inviteStatus: 'accepted',
          // speciality: 'Gynacology',
          // education: 'MBBS',
          // services: 'Consultations, Surgery',
          // designation: 'GENERAL PHYSICIAN',
          // uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
        },
        {
          firstName: 'John',
          lastName: 'Carter',
          experience: '7',
          typeOfConsult: '24/7',
          inviteStatus: 'Not accepted',
        },
      ] as Doctor[],
      consultationHours: [
        {
          days: 'Tue, Wed',
          timings: '02:00 PM - 3:30 PM',
          availableForPhysicalConsultation: true,
          availableForVirtualConsultation: true,
          type: 'fixed',
        },
      ],
    },
  },
};

const _doctors = [
  {
    profile: {
      id: '1',
      firstName: 'Ranjit',
      lastName: 'Mehra',
      mobileNumber: '',
      experience: '',
      isStarDoctor: true,
    },
  },
  {
    profile: {
      id: '2',
      firstName: 'Simran',
      lastName: 'Kaur',
      mobileNumber: '',
      experience: '',
      isStarDoctor: true,
    },
  },
  {
    profile: {
      id: '3',
      firstName: 'Pranjal',
      lastName: 'Seth',
      mobileNumber: '',
      experience: '',
      isStarDoctor: false,
    },
  },
] as DoctorProfile[];

export const _filterDoctors = (searchString: string): DoctorProfile[] => {
  return _doctors.filter((doctor) => {
    return (
      (doctor.profile.firstName + ' ' + doctor.profile.lastName)
        .toLowerCase()
        .indexOf(searchString.toLowerCase()) > -1
    );
  });
};

export const getDoctorsForStarDoctorProgram: DummyQueryResult = {
  error: null,
  loading: false,
  data: {
    getDoctorsForStarDoctorProgram: async (searchString: string) =>
      Promise.resolve(_filterDoctors(searchString)),
  },
};
