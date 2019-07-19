import { SearchData } from 'profiles-service/resolvers/getPastSearches';

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
}

export const searchData: SearchData[] = [
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: 'a6ef960c-fc1f-4a12-878a-12063788d625',
    name: 'Dr. Nancy Williams',
    image: 'https://dev.popcornapps.com/apolloImages/doctor.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '17d15451-ee28-4f5c-9550-8f794f3938c4',
    name: 'Dr. Simran Rai',
    image: 'https://dev.popcornapps.com/apolloImages/doctor.png',
  },
  {
    searchType: SEARCH_TYPE.SPECIALTY,
    typeId: 'c4c0f83e-7b8b-4033-8ab7-ab49b07d5771',
    name: 'General Physician',
    image: 'https://dev.popcornapps.com/apolloImages/specialty.png',
  },
  {
    searchType: SEARCH_TYPE.SPECIALTY,
    typeId: 'd2c598b4-7fd5-4684-b3a1-6e480f8dbf6d',
    name: 'Cardiology',
    image: 'https://dev.popcornapps.com/apolloImages/specialty.png',
  },
];
