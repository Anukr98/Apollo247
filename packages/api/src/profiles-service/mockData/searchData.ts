import { SearchData } from 'profiles-service/resolvers/getPastSearches';

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
}

export const searchData: SearchData[] = [
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '046285b4-5839-4128-a9e4-6183e8592a1f',
    name: 'Dr. Anuradha Panda',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_3.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '9f75e0ef-af0e-4c2e-90e9-68dc40f46c48',
    name: 'Dr. Simran Rai',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_5.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '44783bf5-8084-42e2-adf0-2bcfabe1fef5',
    name: 'Dr. Sudhir Kumar',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_6.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '1a1f2b6b-53d9-4ba8-82dc-f1f1592701ad',
    name: 'Dr. Kiran Pralhad Sudhare',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_2.png',
  },
  {
    searchType: SEARCH_TYPE.SPECIALTY,
    typeId: '029eae45-4185-448b-96c1-7b4e4572bb6f',
    name: 'General Physician',
    image: 'https://dev.popcornapps.com/apolloImages/specialty.png',
  },
  {
    searchType: SEARCH_TYPE.SPECIALTY,
    typeId: '8c601eae-9bf8-4181-9287-aa9534d8d993',
    name: 'Cardiology',
    image: 'https://dev.popcornapps.com/apolloImages/specialty.png',
  },
];
