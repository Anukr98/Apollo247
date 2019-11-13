import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DIAGNOSTICS_TYPE } from 'profiles-service/entities';
import { DiagnosticsRepository } from 'profiles-service/repositories/diagnosticsRepository';

export const diagnosticsTypeDefs = gql`
  enum DIAGNOSTICS_TYPE {
    TEST
    PACKAGE
  }

  type SearchDiagnosticsResult {
    diagnostics: [Diagnostics]
  }

  type Diagnostics {
    id: ID!
    itemId: Int!
    itemName: String!
    gender: String!
    rate: Int!
    itemRemarks: String!
    city: String!
    state: String!
    itemType: DIAGNOSTICS_TYPE
  }

  extend type Query {
    searchDiagnostics(city: String, patientId: String, searchText: String): SearchDiagnosticsResult!
  }
`;

type SearchDiagnosticsResult = {
  diagnostics: Diagnostics[];
};

type Diagnostics = {
  id: string;
  itemId: number;
  itemName: string;
  gender: string;
  rate: number;
  itemRemarks: string;
  city: string;
  state: string;
  itemType: DIAGNOSTICS_TYPE;
};

const searchDiagnostics: Resolver<
  null,
  { city: string; patientId: string; searchText: string },
  ProfilesServiceContext,
  SearchDiagnosticsResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const diagnostics = await diagnosticsRepo.searchDiagnostics(args.searchText, args.city);
  return { diagnostics };
};

export const diagnosticsResolvers = {
  Query: {
    searchDiagnostics,
  },
};
