import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { SEARCH_TYPE } from 'profiles-service/entities';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';

export const getPatientPastSearchesTypeDefs = gql`
  extend type Query {
    getPatientPastSearches(patientId: ID!): [SearchData]!
    getPatientPastMedicineSearches(patientId: ID!, type: SEARCH_TYPE): [SearchData]!
  }
`;

export type SearchData = {
  searchType: SEARCH_TYPE;
  typeId: string;
  name: string;
  image: string;
};

const getPatientPastSearches: Resolver<
  null,
  { patientId: string },
  ProfilesServiceContext,
  SearchData[]
> = async (parent, args, { profilesDb, doctorsDb }) => {
  const searchHistoryRepository = profilesDb.getCustomRepository(SearchHistoryRepository);
  const recentSearches = await searchHistoryRepository.getPatientRecentSearchHistory(
    args.patientId,
    [SEARCH_TYPE.DOCTOR, SEARCH_TYPE.SPECIALTY]
  );
  const pastSearches: SearchData[] = [];
  if (recentSearches.length > 0) {
    //get search data ids
    const searchTypeIds = recentSearches.map((search) => {
      return search.typeId;
    });

    //To convert array into an object
    const searchObject: { [index: string]: SearchData } = {};
    const convertArrayToObject = (array: SearchData[]) =>
      array.reduce((searchObject, item: SearchData) => {
        searchObject[item.typeId] = item;
        return searchObject;
      }, searchObject);

    //get all searched doctors details
    const doctorsRepository = doctorsDb.getCustomRepository(DoctorRepository);
    const searchDoctorsArray = await doctorsRepository.getSearchDoctorsByIds(searchTypeIds);
    const searchDoctorsObject = convertArrayToObject(searchDoctorsArray);

    //get all searched specialties details
    const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    const searchSpecialtiesArray = await specialtiesRepo.getSearchSpecialtiesByIds(searchTypeIds);
    const searchSpecialtiesObject = convertArrayToObject(searchSpecialtiesArray);

    //forming response as an array of SearchData
    recentSearches.forEach((item) => {
      let searchItem;
      if (item.type == 'DOCTOR') {
        searchItem = searchDoctorsObject[item.typeId];
        searchItem.searchType = SEARCH_TYPE.DOCTOR;
      } else {
        searchItem = searchSpecialtiesObject[item.typeId];
        searchItem.searchType = SEARCH_TYPE.SPECIALTY;
      }
      pastSearches.push(searchItem);
    });
  }
  return pastSearches;
};

const getPatientPastMedicineSearches: Resolver<
  null,
  { patientId: string; type: SEARCH_TYPE },
  ProfilesServiceContext,
  SearchData[]
> = async (parent, args, { profilesDb, doctorsDb }) => {
  const searchHistoryRepository = profilesDb.getCustomRepository(SearchHistoryRepository);
  const searchType = args.type && args.type === SEARCH_TYPE.TEST ? args.type : SEARCH_TYPE.MEDICINE;
  const recentMedicineSearches = await searchHistoryRepository.getPatientRecentSearchHistory(
    args.patientId,
    [searchType]
  );
  const pastSearches: SearchData[] = [];
  if (recentMedicineSearches.length > 0) {
    recentMedicineSearches.forEach((search) => {
      const searchItem = {
        searchType: searchType,
        typeId: search.typeId,
        name: search.typeName,
        image: search.image,
      };
      pastSearches.push(searchItem);
    });
  }
  return pastSearches;
};

export const getPatientPastSearchesResolvers = {
  Query: {
    getPatientPastSearches,
    getPatientPastMedicineSearches,
  },
};
