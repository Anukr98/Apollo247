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
        specialization: 'Gynacologist',
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
          specialization: 'Gynacologist',
          education: 'MBBS',
          services: 'Consultations, Surgery',
          // uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png',
        },
        {
          firstName: 'John',
          lastName: 'Carter',
          experience: '7',
          typeOfConsult: '24/7',
          inviteStatus: 'Not accepted',
          specialization: 'Gynacologist',
          education: 'MBBS',
          services: 'Consultations, Surgery',
        },
      ] as Doctor[],
      consultationHours: [
        {
          days: 'Tue, Wed',
          startTime: '15:15:30Z',
          endTime: '20:15:30Z',
          availableForPhysicalConsultation: true,
          availableForVirtualConsultation: true,
          type: 'fixed',
        },
      ],
      appointments: [
        {
          doctorname: 'Seema Singh Haniya Chakraborthy',
          timings: '11:10 - 11:25 AM ',
          disease: 'FEVER',
          wayOfContact: 'audio',
          timeslottype: 'past',
        },
        {
          doctorname: 'Prateek Sharma',
          timings: '11:30 - 11:45 PM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'missed',
        },
        {
          doctorname: 'Joseph George',
          timings: '11:45 - 12:00 AM ',
          disease: 'FEVER',
          wayOfContact: 'audio',
          timeslottype: 'up-next',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'next',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'next',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'missed',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'next',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'missed',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'next',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'missed',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'next',
        },
        {
          doctorname: 'Joseph George',
          timings: '12:30 - 12:45 AM ',
          disease: 'FEVER',
          wayOfContact: 'video',
          timeslottype: 'next',
        },
      ],
    },
  },
};

export const _doctors = [
  {
    profile: {
      id: '1',
      firstName: 'Sore Throat',
    },
  },
  {
    profile: {
      id: '2',
      firstName: 'Sorosis',
    },
  },
  {
    profile: {
      id: '3',
      firstName: 'Mayuri',
    },
  },
  {
    profile: {
      id: '4',
      firstName: 'Apollo',
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
