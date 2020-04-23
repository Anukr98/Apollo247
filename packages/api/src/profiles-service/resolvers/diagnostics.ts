import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import {
  DIAGNOSTICS_TYPE,
  TEST_COLLECTION_TYPE,
  DiagnosticOrgans,
  DiagnosticHotSellers,
} from 'profiles-service/entities';
import { DiagnosticsRepository } from 'profiles-service/repositories/diagnosticsRepository';
import { DiagnosticOrgansRepository } from 'profiles-service/repositories/diagnosticOrgansRepository';
import fetch from 'node-fetch';
import { format } from 'date-fns';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { log } from 'customWinstonLogger';

export const diagnosticsTypeDefs = gql`
  enum DIAGNOSTICS_TYPE {
    TEST
    PACKAGE
  }

  enum TEST_COLLECTION_TYPE {
    HC
    CENTER
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
    fromAgeInDays: Int!
    toAgeInDays: Int!
    testPreparationData: String!
    collectionType: TEST_COLLECTION_TYPE
  }

  type DiagnosticSlotsResult {
    diagnosticSlot: [EmployeeSlots]
    diagnosticBranchCode: String
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

  type DiagnosticOrgans {
    id: ID!
    organName: String
    organImage: String
    diagnostics: Diagnostics
  }

  type DiagnosticHotSellers {
    id: ID!
    packageName: String
    price: Float
    packageImage: String
    diagnostics: Diagnostics
  }

  type DiagnosticsData {
    diagnosticOrgans: [DiagnosticOrgans]
    diagnosticHotSellers: [DiagnosticHotSellers]
  }

  extend type Query {
    searchDiagnostics(
      city: String
      patientId: String
      searchText: String!
      isActive: Boolean
    ): SearchDiagnosticsResult!
    searchDiagnosticsById(itemIds: String): SearchDiagnosticsResult!
    getDiagnosticsCites(patientId: String, cityName: String): GetAllCitiesResult!
    getDiagnosticSlots(
      patientId: String
      hubCode: String
      selectedDate: Date
      zipCode: Int
    ): DiagnosticSlotsResult!
    getDiagnosticsData: DiagnosticsData!
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
  fromAgeInDays: number;
  toAgeInDays: number;
  testPreparationData: string;
  collectionType: TEST_COLLECTION_TYPE;
};

type DiagnosticSlotsResult = {
  diagnosticSlot: EmployeeSlots[];
  diagnosticBranchCode: string;
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

type DiagnosticsData = {
  diagnosticOrgans: DiagnosticOrgans[];
  diagnosticHotSellers: DiagnosticHotSellers[];
};

const searchDiagnostics: Resolver<
  null,
  { city: string; patientId: string; searchText: string; isActive: boolean },
  ProfilesServiceContext,
  SearchDiagnosticsResult
> = async (parent, args, { profilesDb }) => {
  if (args.searchText.trim().length == 0)
    throw new AphError(AphErrorMessages.INVALID_SEARCH_VALUE, undefined, {});

  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const diagnostics = args.city
    ? await diagnosticsRepo.searchDiagnostics(args.searchText.toUpperCase(), args.city)
    : await diagnosticsRepo.searchDiagnosticswithoutcity(args.searchText.toUpperCase());
  return { diagnostics };
};

const searchDiagnosticsById: Resolver<
  null,
  { itemIds: string },
  ProfilesServiceContext,
  SearchDiagnosticsResult
> = async (parent, args, { profilesDb }) => {
  if (args.itemIds.trim().length == 0)
    throw new AphError(AphErrorMessages.INVALID_SEARCH_VALUE, undefined, {});
  const diagnosticsRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const diagnostics: Diagnostics[] = [];
  function getDiagnosticData(itemId: number) {
    return new Promise<Diagnostics>(async (resolve) => {
      const diagnostic = await diagnosticsRepo.findDiagnosticById(itemId);
      if (diagnostic) {
        diagnostics.push(diagnostic);
      }
      resolve(diagnostic);
    });
  }
  const itemIds: string[] = args.itemIds.split(',');
  const promises: object[] = [];
  if (itemIds.length > 0) {
    itemIds.forEach(async (id) => {
      promises.push(getDiagnosticData(parseInt(id, 0)));
    });
  }
  await Promise.all(promises);
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

  return { diagnosticsCities };
};

const getDiagnosticSlots: Resolver<
  null,
  { patientId: String; hubCode: string; selectedDate: Date; zipCode: number },
  ProfilesServiceContext,
  DiagnosticSlotsResult
> = async (patent, args, { profilesDb }) => {
  const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const hubDetails = await diagnosticRepo.findHubByZipCode(args.zipCode.toString());
  if (hubDetails == null) throw new AphError(AphErrorMessages.INVALID_ZIPCODE, undefined, {});
  const selDate = format(args.selectedDate, 'yyyy-MM-dd');
  const diagnosticSlotsUrl = process.env.DIAGNOSTIC_SLOTS_URL;
  const apiUrl = `${diagnosticSlotsUrl}&jobType=home_collection&hubCode=${hubDetails.pincodeAreaname}&transactionDate=${selDate}`;
  log(
    'profileServiceLogger',
    `EXTERNAL_API_CALL_DIAGNOSTICS: ${apiUrl}`,
    'getDiagnosticSlots()->API_CALL_STARTING',
    '',
    ''
  );
  const diagnosticSlot = await fetch(apiUrl)
    .then((res) => res.json())
    .catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'getDiagnosticSlots()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {});
    });
  log(
    'profileServiceLogger',
    'API_CALL_RESPONSE',
    'getDiagnosticSlots()->API_CALL_RESPONSE',
    JSON.stringify(diagnosticSlot),
    ''
  );
  console.log(diagnosticSlot, 'diagnosticSlot');
  return { diagnosticBranchCode: hubDetails.route, diagnosticSlot };
};

const getDiagnosticsData: Resolver<null, {}, ProfilesServiceContext, DiagnosticsData> = async (
  patent,
  args,
  { profilesDb }
) => {
  const organRepo = profilesDb.getCustomRepository(DiagnosticOrgansRepository);
  const diagnosticOrgans = await organRepo.getDiagnosticOrgansList();
  const diagnosticHotSellers = await organRepo.getHotSellersList();
  return { diagnosticOrgans, diagnosticHotSellers };
};

export const diagnosticsResolvers = {
  Query: {
    searchDiagnostics,
    getDiagnosticsCites,
    getDiagnosticSlots,
    getDiagnosticsData,
    searchDiagnosticsById,
  },
};
