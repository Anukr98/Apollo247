import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, SearchHistory, SEARCH_TYPE } from 'profiles-service/entities';
import { SearchHistoryRepository } from 'profiles-service/repositories/searchHistoryRepository';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { DoctorSpecialtyRepository } from 'doctors-service/repositories/doctorSpecialtyRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const saveSearchTypeDefs = gql`
  input SaveSearchInput {
    type: SEARCH_TYPE
    typeId: ID!
    typeName: String
    image: String
    patient: ID!
  }

  type SearchHistory {
    id: ID!
    typeId: ID!
    type: SEARCH_TYPE!
    patient: Patient
    image: String
  }

  type SaveSearchResult {
    saveStatus: Boolean
  }

  extend type Mutation {
    saveSearch(saveSearchInput: SaveSearchInput): SaveSearchResult!
  }
`;

type SaveSearchInput = {
  type: SEARCH_TYPE;
  typeId: string;
  typeName: string;
  image: string;
  patient: Patient;
};

type SaveSearchInputArgs = { saveSearchInput: SaveSearchInput };

type SaveSearchResult = {
  saveStatus: boolean;
};

const saveSearch: Resolver<
  null,
  SaveSearchInputArgs,
  ProfilesServiceContext,
  SaveSearchResult
> = async (parent, { saveSearchInput }, { profilesDb, doctorsDb }) => {
  const saveSearchAttrs: Omit<Partial<SearchHistory>, 'id'> = {
    ...saveSearchInput,
  };

  //validating typeId
  if (saveSearchAttrs.typeId == null) throw new AphError(AphErrorMessages.SAVE_SEARCH_ERROR);
  if (saveSearchAttrs.type == 'DOCTOR') {
    const doctorRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctorData = await doctorRepo.findById(saveSearchAttrs.typeId);
    if (doctorData == null) {
      throw new AphError(AphErrorMessages.INVALID_DOCTOR_ID, undefined, {});
    }
  } else if (saveSearchAttrs.type == 'SPECIALTY') {
    const specialtiesRepo = doctorsDb.getCustomRepository(DoctorSpecialtyRepository);
    const specialtyData = await specialtiesRepo.findById(saveSearchAttrs.typeId);
    if (specialtyData == null) {
      throw new AphError(AphErrorMessages.INVALID_SPECIALTY_ID, undefined, {});
    }
  } else if (saveSearchAttrs.type == 'MEDICINE') {
    //Medicine TypeId(SKUID) validation logic here
  } else if (saveSearchAttrs.type == 'TEST') {
    //Diagnostics Test ID validation logic here
  }

  const searchHistoryRepository = profilesDb.getCustomRepository(SearchHistoryRepository);
  const pastSearchRecords = await searchHistoryRepository.findByPatientAndType(saveSearchAttrs);
  if (pastSearchRecords.length > 0) {
    await searchHistoryRepository.updatePastSearch(saveSearchAttrs);
  } else {
    await searchHistoryRepository.saveSearch(saveSearchAttrs);
  }
  return { saveStatus: true };
};

export const saveSearchResolvers = {
  Mutation: {
    saveSearch,
  },
};
