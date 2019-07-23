import { DoctorProfile } from 'doctors-service/resolvers/getDoctors';
import { Gender } from 'profiles-service/entity/patient';

export enum INVITEDSTATUS {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  NOTAPPLICABLE = 'NOTAPPLICABLE',
  NONE = 'NONE',
}
export const DoctorsData: DoctorProfile[] = [
  {
    profile: {
      id: 'c4c0f83e-7b8b-4033-8ab7-ab49b07d5771',
      salutation: 'Dr',
      firstName: 'Anuradha',
      lastName: 'Pande',
      gender: Gender.FEMALE,
      experience: '7',
      mobileNumber: '1234567890',
      speciality: 'Gynacology',
      specialization: 'Gynecologist',
      isStarDoctor: true,
      education: 'MBBS',
      services: 'Consultations, Surgery',
      languages: 'English,Hindi,Telgu',
      city: 'Hyderabad',
      awards: 'Ramon Magsaysay Award',
      registrationNumber: '123456',
      isProfileComplete: false,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '300',
      physicalConsultationFees: '300',
      package: '3 Online Consults + 3 Physical Consults @ Rs.999',
      inviteStatus: INVITEDSTATUS.NOTAPPLICABLE,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_3.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Jubilee Hills',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 7890',
        address: 'State Bank of India, Powal',
      },
    ],
    clinics: [
      {
        id: '841c15e8-e570-4d1a-b5d3-8251913f8b51',
        name: 'Homeocare Hospital',
        addressLine1: 'SLN Terminus, No. 18, 2nd Floor',
        addressLine2: 'Gachibowli',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '0f00b278-2916-42ae-8150-490a5420b5fd',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [
      {
        id: '648562f4-d868-4890-8168-3a4b138ac29a',
        salutation: 'Dr',
        firstName: 'David',
        lastName: 'Mcmarrow',
        gender: Gender.MALE,
        experience: '7',
        speciality: 'Cardiology',
        education: 'MS (cardiology)',
        mobileNumber: '1234567890',
        specialization: 'Cardiologist',
        isStarDoctor: false,
        services: 'Consultations, Surgery',
        languages: 'English,Hindi',
        city: 'Hyderabad',
        awards: 'Ramon Magsaysay Award',
        registrationNumber: '123456',
        isProfileComplete: false,
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '300',
        physicalConsultationFees: '300',
        package: '3 Online Consults + 3 Physical Consults @ Rs.999',
        inviteStatus: INVITEDSTATUS.ACCEPTED,
        photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_1.png',
        profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
        address: 'Apollo Hospital, Hyderguda',
      },
      {
        id: 'f69f31b8-c90d-4758-b711-ba9ea21d9fac',
        salutation: 'Dr',
        firstName: 'John',
        lastName: 'Carter',
        gender: Gender.MALE,
        experience: '7',
        speciality: 'ENT',
        education: 'MBBS',
        mobileNumber: '1234567890',
        specialization: 'ENT',
        isStarDoctor: false,
        services: 'Consultations, ENT',
        languages: 'English',
        city: 'Hyderabad',
        awards: 'R.D. Birla Award (2014)',
        registrationNumber: '123456',
        isProfileComplete: false,
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '400',
        physicalConsultationFees: '600',
        package: '2 Online Consults + 2 Physical Consults @ Rs.999',
        inviteStatus: INVITEDSTATUS.ACCEPTED,
        photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_6.png',
        profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
        address: 'Apollo Hospital, Secunderabad',
      },
    ],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '15:15:30Z',
        endTime: '20:15:30Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '06:00:00Z',
        endTime: '20:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: '648562f4-d868-4890-8168-3a4b138ac29a',
      salutation: 'Dr',
      firstName: 'David',
      lastName: 'Mcmarrow',
      gender: Gender.MALE,
      experience: '7',
      speciality: 'Cardiology',
      education: 'MS (cardiology)',
      mobileNumber: '1234567890',
      specialization: 'Cardiologist',
      isStarDoctor: false,
      services: 'Consultations, Surgery',
      languages: 'English,Hindi',
      city: 'Hyderabad',
      awards: 'Ramon Magsaysay Award',
      registrationNumber: '123456',
      isProfileComplete: false,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '300',
      physicalConsultationFees: '300',
      package: '3 Online Consults + 3 Physical Consults @ Rs.999',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_1.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Hyderguda',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 1231',
        address: 'State Bank of India, Hyderabad',
      },
    ],
    clinics: [
      {
        id: '49ac3919-5be3-4a5e-8014-cc7756f149ae',
        name: 'Star Hospital',
        addressLine1: 'Sky Towers, No. 18, 3rd Floor',
        addressLine2: 'Banjara Hills',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '55b55ee7-0334-4eff-9d16-233d2b33278a',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '09:30:00Z',
        endTime: '13:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '07:00:00Z',
        endTime: '21:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: 'f69f31b8-c90d-4758-b711-ba9ea21d9fac',
      salutation: 'Dr',
      firstName: 'John',
      lastName: 'Carter',
      gender: Gender.MALE,
      experience: '7',
      speciality: 'ENT',
      education: 'MBBS',
      mobileNumber: '1234567890',
      specialization: 'ENT',
      isStarDoctor: false,
      services: 'Consultations, ENT',
      languages: 'English',
      city: 'Hyderabad',
      awards: 'R.D. Birla Award (2014)',
      registrationNumber: '123456',
      isProfileComplete: false,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '400',
      physicalConsultationFees: '600',
      package: '2 Online Consults + 2 Physical Consults @ Rs.999',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_6.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Secunderabad',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 4556',
        address: 'State Bank of India, Hyderabad',
      },
    ],
    clinics: [
      {
        id: 'f42fce1f-6e8a-42aa-bc80-b6d6bd579e50',
        name: 'Star Hospital',
        addressLine1: 'Sky Towers, No. 18, 3rd Floor',
        addressLine2: 'Banjara Hills',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '3b7e6097-e9d8-4888-b75e-4bd069176933',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '09:30:00Z',
        endTime: '13:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '07:00:00Z',
        endTime: '21:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: 'a6ef960c-fc1f-4a12-878a-12063788d625',
      salutation: 'Dr',
      firstName: 'Nancy',
      lastName: 'Willams',
      experience: '7',
      gender: Gender.FEMALE,
      mobileNumber: '1111111111',
      speciality: 'General Physician',
      specialization: 'Physician',
      isStarDoctor: true,
      education: 'MBBS,MD',
      services: 'Consultations, Surgery, Physio',
      languages: 'English,Hindi,Telgu',
      city: 'Hyderabad',
      awards: 'top doctor award',
      registrationNumber: '789012',
      isProfileComplete: true,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '300',
      physicalConsultationFees: '300',
      package: '2 Online Consults + 2 Physical Consults @ Rs.499',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_5.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Jubilee Hills',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 7890',
        address: 'State Bank of India, Powal',
      },
    ],
    clinics: [
      {
        id: '13251d91-5f52-413e-b718-7712fc4121d8',
        name: 'City Hospital',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        addressLine1: 'House No. 10, Road No 2',
        addressLine2: 'Castle Hills',
        addressLine3: 'Begumpet',
        city: 'Hyderabad',
        isClinic: true,
      },
      {
        id: '15933e63-e2db-4067-b971-da3dc1c79c77',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [
      {
        id: '87b12e7e-6838-458e-9798-3a3a800573d2',
        salutation: 'Dr',
        firstName: 'Kathrine',
        lastName: 'Harvey',
        gender: Gender.FEMALE,
        experience: '4',
        speciality: 'Radiology',
        education: 'MBBS',
        mobileNumber: '9999999999',
        specialization: 'Radilogist',
        isStarDoctor: false,
        services: 'Consultations, Radiology',
        languages: 'English,Hindi',
        city: 'Hyderabad',
        awards: 'William E. Ladd Medal',
        registrationNumber: '123249',
        isProfileComplete: true,
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '399',
        physicalConsultationFees: '699',
        package: '2 Online Consults + 2 Physical Consults @ Rs.599',
        inviteStatus: INVITEDSTATUS.ACCEPTED,
        photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_3.png',
        profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
        address: 'Apollo Hospital, Secunderabad',
      },
      {
        id: 'a759f343-7bbf-4bea-8058-f849724b2dda',
        salutation: 'Dr',
        firstName: 'Steve',
        lastName: 'Watson',
        gender: Gender.MALE,
        experience: '3',
        speciality: 'Vascular Surgery',
        education: 'MBBS (Surgery)',
        mobileNumber: '9999999999',
        specialization: 'Surgery',
        isStarDoctor: false,
        services: 'Consultations, Surgery, Physio',
        languages: 'English',
        city: 'Hyderabad',
        awards: 'Top doctor award',
        registrationNumber: '657345',
        isProfileComplete: true,
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '599',
        physicalConsultationFees: '1099',
        package: '2 Online Consults + 2 Physical Consults @ Rs.1599',
        inviteStatus: INVITEDSTATUS.ACCEPTED,
        photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_4.png',
        profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
        address: 'Apollo Hospital, Jubilee Hills',
      },
    ],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '15:15:30Z',
        endTime: '20:15:30Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '06:00:00Z',
        endTime: '20:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: '87b12e7e-6838-458e-9798-3a3a800573d2',
      salutation: 'Dr',
      firstName: 'Kathrine',
      lastName: 'Harvey',
      gender: Gender.FEMALE,
      experience: '4',
      speciality: 'Radiology',
      education: 'MBBS',
      mobileNumber: '9999999999',
      specialization: 'Radilogist',
      isStarDoctor: false,
      services: 'Consultations, Radiology',
      languages: 'English,Hindi',
      city: 'Hyderabad',
      awards: 'William E. Ladd Medal',
      registrationNumber: '123249',
      isProfileComplete: true,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '399',
      physicalConsultationFees: '699',
      package: '2 Online Consults + 2 Physical Consults @ Rs.599',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_3.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Secunderabad',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 6233',
        address: 'State Bank of India, Hyderabad',
      },
    ],
    clinics: [
      {
        id: '73c53313-41d5-451f-b798-a27a6310108e',
        name: 'Care Hospital',
        addressLine1: 'Road No. 6',
        addressLine2: 'Banjara Hills',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '3315b7a4-7fd7-4064-9cca-0ea1b9ed8855',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '09:30:00Z',
        endTime: '13:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '07:00:00Z',
        endTime: '21:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: 'a759f343-7bbf-4bea-8058-f849724b2dda',
      salutation: 'Dr',
      firstName: 'Steve',
      lastName: 'Watson',
      gender: Gender.MALE,
      experience: '3',
      speciality: 'Vascular Surgery',
      education: 'MBBS (Surgery)',
      mobileNumber: '9999999999',
      specialization: 'Surgery',
      isStarDoctor: false,
      services: 'Consultations, Surgery, Physio',
      languages: 'English',
      city: 'Hyderabad',
      awards: 'Top doctor award',
      registrationNumber: '657345',
      isProfileComplete: true,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '599',
      physicalConsultationFees: '1099',
      package: '2 Online Consults + 2 Physical Consults @ Rs.1599',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_4.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Jubilee Hills',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 2331',
        address: 'State Bank of India, Hyderabad',
      },
    ],
    clinics: [
      {
        id: 'df843c35-33aa-4a34-933b-b8fc0067f369',
        name: 'Gandhi Hospital',
        addressLine1: 'Road No. 1',
        addressLine2: 'Yousufguda',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '541bf085-bb2d-4f46-918c-9857af5b9d56',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '09:30:00Z',
        endTime: '13:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '16:00:00Z',
        endTime: '21:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: '17d15451-ee28-4f5c-9550-8f794f3938c4',
      salutation: 'Dr',
      firstName: 'Simran',
      lastName: 'Rai',
      gender: Gender.FEMALE,
      experience: '7',
      mobileNumber: '9999999999',
      speciality: 'General Physician',
      specialization: 'Physician',
      isStarDoctor: true,
      education: 'MBBS (Internal Medicine)',
      services: 'Consultations, Surgery, Physio',
      languages: 'English,Hindi,Telgu',
      city: 'Hyderabad',
      awards: 'Top doctor award',
      registrationNumber: '689013',
      isProfileComplete: true,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '299',
      physicalConsultationFees: '499',
      package: '2 Online Consults + 2 Physical Consults @ Rs.599',
      inviteStatus: INVITEDSTATUS.NOTAPPLICABLE,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_5.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Secunderabad',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 2345',
        address: 'State Bank of India, Hyderabad',
      },
    ],
    clinics: [
      {
        id: '307662d3-e53e-4968-bcbc-56542e96f2fe',
        name: 'Apollo Hospital',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        addressLine1: 'Apollo Hospitals, Road No 72',
        addressLine2: 'Jubilee Hills',
        addressLine3: '',
        city: 'Hyderabad',
        isClinic: true,
      },
      {
        id: 'cf573a80-5005-413d-905d-f7d1143ffe1f',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [
      {
        id: '101f2b01-100f-49f5-9fc7-f0e762a8b40e',
        salutation: 'Dr',
        firstName: 'Jeevan',
        lastName: 'Kumar',
        gender: Gender.MALE,
        experience: '3',
        speciality: 'General Medicine',
        education: 'MBBS (Internal Medicine)',
        mobileNumber: '9999999999',
        specialization: 'General Physician',
        isStarDoctor: false,
        services: 'Consultations, Surgery, Physio',
        languages: 'English,Telgu',
        city: 'Hyderabad',
        awards: 'Top doctor award',
        registrationNumber: '342245',
        isProfileComplete: true,
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '199',
        physicalConsultationFees: '399',
        package: '2 Online Consults + 2 Physical Consults @ Rs.599',
        inviteStatus: INVITEDSTATUS.ACCEPTED,
        photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_2.png',
        profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
        address: 'Apollo Hospital, Jubilee Hills',
      },
      {
        id: 'e392e6ff-de1b-45a2-8a75-02f46ae703a7',
        salutation: 'Dr',
        firstName: 'David',
        lastName: 'Yates',
        gender: Gender.MALE,
        experience: '4',
        speciality: 'Nephrology',
        education: 'MBBS (Surgery)',
        mobileNumber: '1234567890',
        specialization: 'Nephrologist',
        isStarDoctor: false,
        services: 'Consultations',
        languages: 'English,Telgu',
        city: 'Hyderabad',
        awards: 'Dr. B.C.Roy Award',
        registrationNumber: '123456',
        isProfileComplete: false,
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        onlineConsultationFees: '500',
        physicalConsultationFees: '800',
        package: '3 Online Consults + 3 Physical Consults @ Rs.999',
        inviteStatus: INVITEDSTATUS.ACCEPTED,
        photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_1.png',
        profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
        address: 'Apollo Hospital, Jubilee Hills',
      },
    ],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '15:15:30Z',
        endTime: '20:15:30Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '06:00:00Z',
        endTime: '20:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: '101f2b01-100f-49f5-9fc7-f0e762a8b40e',
      salutation: 'Dr',
      firstName: 'Jeevan',
      lastName: 'Kumar',
      gender: Gender.MALE,
      experience: '3',
      speciality: 'General Medicine',
      education: 'MBBS (Internal Medicine)',
      mobileNumber: '9999999999',
      specialization: 'General Physician',
      isStarDoctor: false,
      services: 'Consultations, Surgery, Physio',
      languages: 'English,Telgu',
      city: 'Hyderabad',
      awards: 'Top doctor award',
      registrationNumber: '342245',
      isProfileComplete: true,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '199',
      physicalConsultationFees: '399',
      package: '2 Online Consults + 2 Physical Consults @ Rs.599',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_2.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Jubilee Hills',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 4233',
        address: 'State Bank of India, Secunderabad',
      },
    ],
    clinics: [
      {
        id: '9488298b-577b-4910-a02b-ad0500dd2aa6',
        name: 'Hope Clinic',
        addressLine1: 'Street No 12',
        addressLine2: 'Secunderabad',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '1231815c-29e7-4015-bf61-6c76f06c9b99',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '09:30:00Z',
        endTime: '13:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '07:00:00Z',
        endTime: '21:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
  {
    profile: {
      id: 'e392e6ff-de1b-45a2-8a75-02f46ae703a7',
      salutation: 'Dr',
      firstName: 'David',
      lastName: 'Yates',
      gender: Gender.MALE,
      experience: '4',
      speciality: 'Nephrology',
      education: 'MBBS (Surgery)',
      mobileNumber: '1234567890',
      specialization: 'Nephrologist',
      isStarDoctor: false,
      services: 'Consultations',
      languages: 'English,Telgu',
      city: 'Hyderabad',
      awards: 'Dr. B.C.Roy Award',
      registrationNumber: '123456',
      isProfileComplete: false,
      availableForPhysicalConsultation: true,
      availableForVirtualConsultation: true,
      onlineConsultationFees: '500',
      physicalConsultationFees: '800',
      package: '3 Online Consults + 3 Physical Consults @ Rs.999',
      inviteStatus: INVITEDSTATUS.ACCEPTED,
      photoUrl: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_1.png',
      profilePhotoUrl: 'https://dev.popcornapps.com/apolloImages/doctor.png',
      address: 'Apollo Hospital, Jubilee Hills',
    },
    paymentDetails: [
      {
        accountNumber: 'XXX XXX XXX 3575',
        address: 'State Bank of India, Hyderabad',
      },
    ],
    clinics: [
      {
        id: '010ca71b-1640-4e79-8831-feb71586c26e',
        name: 'General Clinic',
        addressLine1: 'Road No 10',
        addressLine2: 'Jubilee Hills',
        addressLine3: '',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: true,
      },
      {
        id: '4e9d0938-31e6-4c09-8206-26cf0350d582',
        name: 'Apollo Hospital',
        addressLine1: 'Road No 72',
        addressLine2: 'Film Nagar',
        addressLine3: 'Jubilee Hills',
        city: 'Hyderabad',
        image: 'https://dev.popcornapps.com/apolloImages/clinic.png',
        isClinic: false,
      },
    ],
    starDoctorTeam: [],
    consultationHours: [
      {
        days: 'Mon, Tue, Wed, Thu',
        startTime: '09:30:00Z',
        endTime: '13:00:00Z',
        availableForPhysicalConsultation: true,
        availableForVirtualConsultation: true,
        type: 'Fixed',
      },
      {
        days: 'Sat, Sun',
        startTime: '07:00:00Z',
        endTime: '21:00:00Z',
        availableForPhysicalConsultation: false,
        availableForVirtualConsultation: true,
        type: '',
      },
    ],
  },
];
