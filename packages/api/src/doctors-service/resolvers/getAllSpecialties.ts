import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorSpecialty } from 'doctors-service/entities/';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { getRepository } from 'typeorm';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

export const getAllSpecialtiesTypeDefs = gql`
  type DoctorSpecialty {
    id: ID!
    name: String!
    image: String
  }
  extend type Query {
    getAllSpecialties: [DoctorSpecialty!]!
  }
`;

const getAllSpecialties: Resolver<null, {}, DoctorsServiceContext, DoctorSpecialty[]> = async (
  parent,
  args
) => {
  let allSpecialties: DoctorSpecialty[] = [];
  try {
    allSpecialties = await getRepository(DoctorSpecialty)
      .createQueryBuilder()
      .getMany();
    return allSpecialties;
  } catch (getSpecialtiesError) {
    throw new AphError(AphErrorMessages.GET_SPECIALTIES_ERROR, undefined, { getSpecialtiesError });
  }
  return allSpecialties;
};

export const getAllSpecialtiesResolvers = {
  Query: {
    getAllSpecialties,
  },
};
