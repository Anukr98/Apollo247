import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { DIAGNOSTICS_TYPE } from 'profiles-service/entities';
import { DiagnosticsRepository } from 'profiles-service/repositories/diagnosticsRepository';
import fetch from 'node-fetch';
import { format } from 'date-fns';

export const diagnosticsTypeDefs = gql`
  enum DIAGNOSTICS_TYPE {
    TEST
    PACKAGE
  }

  type SearchDiagnosticsResult {
    diagnostics: [Diagnostics]
  }

  type GetAllCitiesResult {
    diagnosticsCities: [DiagnosticCities]
  }

  type DiagnosticCities {
    cityname: String!
    statename: String!
    cityid: Int!
    stateid: Int!
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

  type DiagnosticSlotsResult {
    diagnosticSlot: [EmployeeSlots]
  }

  type EmployeeSlots {
    employeeCode: String
    employeeName: String
    slotInfo: [SlotInfo]
  }

  type SlotInfo {
    slot: Int
    startTime: String
    endTime: String
    status: String
  }

  extend type Query {
    searchDiagnostics(city: String, patientId: String, searchText: String): SearchDiagnosticsResult!
    getDiagnosticsCites(patientId: String, cityName: String): GetAllCitiesResult!
    getDiagnosticSlots(
      patientId: String
      hubCode: String
      selectedDate: Date
    ): DiagnosticSlotsResult!
  }
`;

type SearchDiagnosticsResult = {
  diagnostics: Diagnostics[];
};

type GetAllCitiesResult = {
  diagnosticsCities: DiagnosticCities[];
};
type DiagnosticCities = {
  cityname: string;
  statename: string;
  cityid: number;
  stateid: number;
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

type DiagnosticSlotsResult = {
  diagnosticSlot: EmployeeSlots[];
};

type EmployeeSlots = {
  employeeCode: string;
  employeeName: string;
  slotInfo: SlotInfo[];
};

type SlotInfo = {
  slot: number;
  startTime: string;
  endTime: string;
  status: string;
};

const searchDiagnostics: Resolver<
  null,
  { city: string; patientId: string; searchText: string },
  ProfilesServiceContext,
  SearchDiagnosticsResult
> = async (parent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const diagnostics = await diagnosticsRepo.searchDiagnostics(
    args.searchText.toUpperCase(),
    args.city
  );
  return { diagnostics };
};

const getDiagnosticsCites: Resolver<
  null,
  { patientId: String; cityName: string },
  ProfilesServiceContext,
  GetAllCitiesResult
> = async (patent, args, { profilesDb }) => {
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const diagnosticsCities = await diagnosticsRepo.getDiagnosticsCites(args.cityName);
  console.log('diagnosticsCities', diagnosticsCities);

  return { diagnosticsCities };
};

const getDiagnosticSlots: Resolver<
  null,
  { patientId: String; hubCode: string; selectedDate: Date },
  ProfilesServiceContext,
  DiagnosticSlotsResult
> = async (patent, args, { profilesDb }) => {
  const selDate = format(args.selectedDate, 'yyyy-MM-dd');
  const diagnosticSlotsUrl = process.env.DIAGNOSTIC_SLOTS_URL;
  const diagnosticSlot = await fetch(
    `${diagnosticSlotsUrl}&jobType=home_collection&hubCode=${args.hubCode}&date=${selDate}`
  )
    .then((res) => res.json())
    .catch((error) => {
      console.log('diagnostic slot error', error);
    });
  return { diagnosticSlot };
};

export const diagnosticsResolvers = {
  Query: {
    searchDiagnostics,
    getDiagnosticsCites,
    getDiagnosticSlots,
  },
};
