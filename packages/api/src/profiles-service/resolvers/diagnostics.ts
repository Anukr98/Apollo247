import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { getToken, updateToken } from 'profiles-service/helpers/itdoseHelper';
import {
  DIAGNOSTICS_TYPE,
  TEST_COLLECTION_TYPE,
  DiagnosticOrgans,
  DiagnosticHotSellers,
} from 'profiles-service/entities';
import { DiagnosticsRepository } from 'profiles-service/repositories/diagnosticsRepository';
import { DiagnosticOrgansRepository } from 'profiles-service/repositories/diagnosticOrgansRepository';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { format, compareAsc, set, parse, add } from 'date-fns';
import { AphError, AphUserInputError } from 'AphError';
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

  type DiagnosticItdoseSlotsResult{	
    slotInfo: [ItdoseSlotInfo]	
  }	
  type ItdoseSlotInfo {	
    TimeslotID: String	
    Timeslot: String	
  }

  type EmployeeSlots {
    employeeCode: String
    employeeName: String
    slotInfo: [SlotInfo]
  }

  type SlotInfo {
    slot: String
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

  type GetDiagnosticsHCCharges {
    charges: Int
  }

  extend type Query {
    searchDiagnostics(
      city: String
      patientId: String
      searchText: String!
    ): SearchDiagnosticsResult!
    searchDiagnosticsById(itemIds: String): SearchDiagnosticsResult!
    getDiagnosticsCites(patientId: String, cityName: String): GetAllCitiesResult!
    getDiagnosticSlots(
      patientId: String
      hubCode: String
      selectedDate: Date
      zipCode: Int
    ): DiagnosticSlotsResult!
    getDiagnosticItDoseSlots(	
      patientId: String	
      selectedDate: Date	
      zipCode: Int	
    ): DiagnosticItdoseSlotsResult!
    getDiagnosticsData: DiagnosticsData!
    getDiagnosticsHCCharges(
      pincode: Int
      slotID: String
      totalCharges: Int
      itemIDs: [Int]
    ): GetDiagnosticsHCCharges!
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

type DiagnosticItdoseSlotsResult = {
  slotInfo: ItdoseSlotInfo[];
};

type ItdoseSlotInfo = {
  TimeslotID: string;
  Timeslot: string;
};

type EmployeeSlots = {
  employeeCode: string;
  employeeName: string;
  slotInfo: SlotInfo[];
};

type SlotInfo = {
  slot: string;
  startTime: string;
  endTime: string;
  status: string;
};

type DiagnosticsData = {
  diagnosticOrgans: DiagnosticOrgans[];
  diagnosticHotSellers: DiagnosticHotSellers[];
};

type GetDiagnosticsHCCharges = {
  charges: number;
};

const searchDiagnostics: Resolver<
  null,
  { city: string; patientId: string; searchText: string },
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
  const token = await getToken();
  const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const area = await diagnosticRepo.findAreabyZipCode(args.zipCode.toString());
  if (!area || !area?.area_id) {
    throw new AphUserInputError(AphErrorMessages.INVALID_ZIPCODE);
  }
  const diagnosticSlotURL = process.env.DIAGNOSTIC_ITDOSE_SLOTS_URL;
  if (!diagnosticSlotURL) {
    throw new AphError(AphErrorMessages.ITDOSE_GET_SLOTS_ERROR, undefined, {
      cause: 'add env DIAGNOSTICS_ITDOSE_LOGIN_URL',
    });
  }
  const formatDate = format(args.selectedDate, 'dd-MMM-yyyy');
  const form = new FormData();
  form.append('AreaID', area?.area_id);
  form.append('Pincode', args.zipCode.toString());
  form.append('AppointmentDate', formatDate);
  const options = {
    method: 'POST',
    body: form,
    headers: { authorization: `Bearer ${token}`, ...form.getHeaders() },
  };

  function checkStatus(res: any) {
    if (res.ok) {
      return res;
    }
    if (res.status == 401) {
      // res.status >= 200 && res.status < 300
      updateToken();
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {
        cause: 'cache is being updated',
      });
    }
    throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {
      cause: 'cache is being updated',
    });
  }

  const diagnosticSlot = await fetch(`${diagnosticSlotURL}`, options)
    .then(checkStatus)
    .then((res) => res.json())
    .catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'getDiagnosticSlots()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, { cause: error.toString() });
    });

  if (diagnosticSlot.status != true || !Array.isArray(diagnosticSlot.data)) {
    throw new AphError(AphErrorMessages.ITDOSE_GET_SLOTS_ERROR, undefined, {
      response: diagnosticSlot,
    });
  }

  let slots: any[]
  slots = []
  const employeeSlot = [
    {
      employeeName: 'apollo_employee_name',
      employeeCode: 'apollo_employee_code',
      slotInfo: slots,
    },
  ];
  
  diagnosticSlot.data.forEach((element: ItdoseSlotInfo) => {
    let skip = false;
    const timeSlotDate = parse(element.Timeslot, 'HH:mm', new Date());
    const selectedTimeSlot = set(args.selectedDate, {
      hours: timeSlotDate.getHours(),
      minutes: timeSlotDate.getMinutes(),
    });
    if (compareAsc(selectedTimeSlot, add(new Date(), { hours: 5, minutes: 30 })) == -1) {
      skip = true;
    }
    if (!skip) {
      slots.push({
        status: 'empty',
        startTime: element.Timeslot,
        endTime: element.Timeslot,
        slot: element.TimeslotID,
      });
    }
  });
  employeeSlot[0].slotInfo = slots
  return {
    diagnosticBranchCode: 'apollo_route',
    diagnosticSlot: employeeSlot,
  };
};

const getDiagnosticsHCCharges: Resolver<
  null,
  { pincode: number; slotID: String; totalCharges: number; itemIDs: number[] },
  ProfilesServiceContext,
  GetDiagnosticsHCCharges
> = async (patient, args, { profilesDb }) => {
  const token = await getToken();
  const diagnosticSlotURL = process.env.DIAGNOSTIC_ITDOSE_HC_CHARGES_URL;
  if (!diagnosticSlotURL) {
    throw new AphError(AphErrorMessages.ITDOSE_HC_CHARGES_URL_ERROR, undefined, {
      cause: 'add env DIAGNOSTIC_ITDOSE_HC_CHARGES_URL',
    });
  }
  const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const area = await diagnosticRepo.findAreabyZipCode(args.pincode.toString());
  if (!area || !area?.area_id) {
    throw new AphUserInputError(AphErrorMessages.INVALID_ZIPCODE);
  }
  const form = new FormData();
  form.append('ItemID', args.itemIDs.join(','));
  form.append('TotalBillAmount', args.totalCharges);
  form.append('StateId', area.state_id);
  form.append('SlotID', args.slotID);
  const options = {
    method: 'POST',
    body: form,
    headers: { authorization: `Bearer ${token}`, ...form.getHeaders() },
  };
  function checkStatus(res: any) {
    if (res.ok) {
      return res;
    }
    console.log(res)
    if (res.status == 401) {
      // res.status >= 200 && res.status < 300
      updateToken();
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {
        cause: 'cache is being updated',
      });
    }
    throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {
      cause: 'cache is being updated',
    });
  }

  const diagnosticSlot = await fetch(`${diagnosticSlotURL}`, options)
    .then(checkStatus)
    .then((res) => res.json())
    .catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'getDiagnosticSlots()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, { cause: error.toString() });
    });

  if (diagnosticSlot.data.length == 0) {
    return { charges: 0 };
  }
  return { charges: diagnosticSlot.data[0].Amount };
};

const getDiagnosticItDoseSlots: Resolver<
  null,
  { patientId: String; selectedDate: Date; zipCode: number },
  ProfilesServiceContext,
  DiagnosticItdoseSlotsResult
> = async (patient, args, { profilesDb }) => {
  const token = await getToken();
  const diagnosticRepo = profilesDb.getCustomRepository(DiagnosticsRepository);
  const area = await diagnosticRepo.findAreabyZipCode(args.zipCode.toString());
  if (!area || !area?.area_id) {
    throw new AphUserInputError(AphErrorMessages.INVALID_ZIPCODE);
  }
  const diagnosticSlotURL = process.env.DIAGNOSTIC_ITDOSE_SLOTS_URL;
  if (!diagnosticSlotURL) {
    throw new AphError(AphErrorMessages.ITDOSE_GET_SLOTS_ERROR, undefined, {
      cause: 'add env DIAGNOSTICS_ITDOSE_LOGIN_URL',
    });
  }
  const formatDate = format(args.selectedDate, 'dd-MMM-yyyy');
  const form = new FormData();
  form.append('AreaID', area?.area_id);
  form.append('Pincode', args.zipCode.toString());
  form.append('AppointmentDate', formatDate);
const options = {
    method: 'POST',
    body: form,
    headers: { authorization: `Bearer ${token}`, ...form.getHeaders() },
  };
  function checkStatus(res: any) {
    if (res.ok) {
      return res;
    }
    if (res.status == 401) {
      // res.status >= 200 && res.status < 300
      updateToken();
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {
        cause: 'cache is being updated',
      });
    }
    throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, {
      cause: 'cache is being updated',
    });
  }

  const diagnosticSlot = await fetch(`${diagnosticSlotURL}`, options)
    .then(checkStatus)
    .then((res) => res.json())
    .catch((error) => {
      log(
        'profileServiceLogger',
        'API_CALL_ERROR',
        'getDiagnosticSlots()->CATCH_BLOCK',
        '',
        JSON.stringify(error)
      );
      throw new AphError(AphErrorMessages.NO_HUB_SLOTS, undefined, { cause: error.toString() });
    });

  if (diagnosticSlot.status != true || !Array.isArray(diagnosticSlot.data)) {
    throw new AphError(AphErrorMessages.ITDOSE_GET_SLOTS_ERROR, undefined, {
      response: diagnosticSlot,
    });
  }

  return { slotInfo: diagnosticSlot.data };
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
    getDiagnosticItDoseSlots,
    getDiagnosticsData,
    searchDiagnosticsById,
    getDiagnosticsHCCharges,
  },
};
