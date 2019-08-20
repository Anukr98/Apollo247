import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Doctor } from 'doctors-service/entities/';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getDoctorsBySpecialtyAndFiltersTypeDefs = gql`
  type FilterDoctorsResult {
    doctors: [DoctorDetails]
  }
  input Range {
    minimum: Int
    maximum: Int
  }
  input FilterDoctorInput {
    specialty: ID!
    city: [String]
    experience: [Range]
    availability: [String]
    availableNow: String
    fees: [Range]
    gender: [Gender]
    language: [String]
    location: String
  }
  extend type Query {
    getDoctorsBySpecialtyAndFilters(filterInput: FilterDoctorInput): FilterDoctorsResult
  }
`;

type FilterDoctorsResult = {
  doctors: Doctor[];
};

export type Range = {
  minimum: number;
  maximum: number;
};

export type FilterDoctorInput = {
  specialty: string;
  city: string[];
  experience: Range[];
  availability: string[];
  availableNow: string;
  fees: Range[];
  gender: string[];
  language: string[];
  location: string;
};

const getDoctorsBySpecialtyAndFilters: Resolver<
  null,
  { filterInput: FilterDoctorInput },
  DoctorsServiceContext,
  FilterDoctorsResult
> = async (parent, args, { doctorsDb, consultsDb }) => {
  let filteredDoctors;
  try {
    const doctorRepository = doctorsDb.getCustomRepository(DoctorRepository);
    filteredDoctors = await doctorRepository.filterDoctors(args.filterInput);
  } catch (filterDoctorsError) {
    throw new AphError(AphErrorMessages.FILTER_DOCTORS_ERROR, undefined, { filterDoctorsError });
  }

  return { doctors: filteredDoctors };
};

export const getDoctorsBySpecialtyAndFiltersTypeDefsResolvers = {
  Query: {
    getDoctorsBySpecialtyAndFilters,
  },
};
