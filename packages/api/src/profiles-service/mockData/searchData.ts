import { SearchData } from 'profiles-service/resolvers/getPastSearches';

export enum SEARCH_TYPE {
  DOCTOR = 'DOCTOR',
  SPECIALTY = 'SPECIALTY',
}

export const searchData: SearchData[] = [
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: 'a8e6a9f3-b9ea-46bc-90fc-f842e8153225',
    name: 'Dr. Anuradha Panda',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_3.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '86f6515-8da0-4bd8-9d17-bc9d201578c6',
    name: 'Dr. Monika Iniyan',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_5.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: 'c951ab4c-67c3-4daf-9dee-4f757a5f0458',
    name: 'Dr. Sudhir Kumar',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_6.png',
  },
  {
    searchType: SEARCH_TYPE.DOCTOR,
    typeId: '8bb0f3db-f1d5-44ce-bdd7-a08c1aeb30d0',
    name: 'Dr. Kiran Pralhad',
    image: 'https://dev.popcornapps.com/apolloImages/doctors/doctor_c_2.png',
  },
  {
    searchType: SEARCH_TYPE.SPECIALTY,
    typeId: '1c223cd2-1b17-45b8-b3f7-2031bdf9bcd8',
    name: 'General Physician',
    image: 'https://dev.popcornapps.com/apolloImages/specialty.png',
  },
  {
    searchType: SEARCH_TYPE.SPECIALTY,
    typeId: 'ebde83c1-7110-4126-9fd3-047075d6cbd2',
    name: 'Cardiology',
    image: 'https://dev.popcornapps.com/apolloImages/specialty.png',
  },
];
