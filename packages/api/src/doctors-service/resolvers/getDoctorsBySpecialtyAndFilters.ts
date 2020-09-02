import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import {
  Doctor,
  DoctorSpecialty,
  ConsultMode,
  SpecialtySearchType,
  DOCTOR_ONLINE_STATUS,
  DoctorType,
} from 'doctors-service/entities/';
import { Client, RequestParams } from '@elastic/elasticsearch';
import { differenceInMinutes } from 'date-fns';

import { ApiConstants } from 'ApiConstants';
import { debugLog } from 'customWinstonLogger';
import { distanceBetweenTwoLatLongInMeters } from 'helpers/distanceCalculator';
import { endOfDay, addDays } from 'date-fns';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const getDoctorsBySpecialtyAndFiltersTypeDefs = gql`
  enum SpecialtySearchType {
    ID
    NAME
  }

  type DefaultfilterType {
    name: String
  }


  type brandType {
    name: String
    image: String
    brandName: String
  }

  type cityType {
    state: String
    data: [String]
  }

  type filters {
    city: [cityType]
    brands: [brandType]
    language: [DefaultfilterType]
    experience: [DefaultfilterType]
    availability: [DefaultfilterType]
    fee: [DefaultfilterType]
    gender: [DefaultfilterType]
  }

  type FilterDoctorsResult {
    doctors: [DoctorDetails]
    doctorsNextAvailability: [DoctorSlotAvailability]
    doctorsAvailability: [DoctorConsultModeAvailability]
    specialty: DoctorSpecialty
    doctorType: DoctorType
    sort: String
    filters: filters
    apolloDoctorCount: Int
    partnerDoctorCount: Int
  }
  type DoctorSlotAvailability {
    doctorId: String
    onlineSlot: String
    physicalSlot: String
    referenceSlot: String
    currentDateTime: Date
    availableInMinutes: Int
  }
  type DoctorConsultModeAvailability {
    doctorId: ID
    availableModes: [ConsultMode]
  }
  input Range {
    minimum: Int
    maximum: Int
  }

  input FilterDoctorInput {
    patientId: ID
    specialty: ID
    specialtySearchType: SpecialtySearchType
    specialtyName: [String]
    city: [String]
    experience: [Range]
    availability: [String]
    availableNow: String
    fees: [Range]
    gender: [Gender]
    language: [String]
    geolocation: Geolocation
    consultMode: ConsultMode
    pincode: String
    doctorType: [String]
    sort: String
    pageNo: Int
    pageSize: Int
  }
  extend type Query {
    getDoctorsBySpecialtyAndFilters(filterInput: FilterDoctorInput): FilterDoctorsResult
  }
`;

type DefaultfilterType = {
  name: string
}

type cityType = {
  state: string
  data: [string]
}

type brandType = {
  name: string
  image: string
  brandName: string
}

type filters = {
  city: [cityType]
  brands: [brandType]
  language: [DefaultfilterType]
  experience: [DefaultfilterType]
  availability: [DefaultfilterType]
  fee: [DefaultfilterType]
  gender: [DefaultfilterType]
}

type FilterDoctorsResult = {
  doctors: Doctor[];
  doctorsNextAvailability: DoctorSlotAvailability[];
  doctorsAvailability: DoctorConsultModeAvailability[];
  specialty?: DoctorSpecialty;
  doctorType?: DoctorType[];
  sort: string;
  filters: filters;
  apolloDoctorCount: number;
  partnerDoctorCount: number;
};

export type DoctorConsultModeAvailability = {
  doctorId: string;
  availableModes: ConsultMode[];
};
export type Range = {
  minimum: number;
  maximum: number;
};

export type Geolocation = {
  latitude: number;
  longitude: number;
};

export type FilterDoctorInput = {
  patientId: string;
  specialty: string;
  specialtySearchType: SpecialtySearchType;
  specialtyName: string[];
  city: string[];
  experience: Range[];
  availability: string[];
  availableNow: string;
  fees: Range[];
  gender: string[];
  language: string[];
  geolocation: Geolocation;
  consultMode: ConsultMode;
  pincode: string;
  doctorType: String[];
  sort: string;
  pageNo: number;
  pageSize: number;
};

export type ConsultModeAvailability = {
  onlineSlots: number;
  physicalSlots: number;
  bothSlots: number;
};
export type DateAvailability = { [index: string]: ConsultModeAvailability };
export type DoctorAvailability = { [index: string]: DateAvailability };
export type AppointmentDateTime = { startDateTime: Date; endDateTime: Date };
export type DoctorsObject = { [index: string]: Doctor };

export type DoctorSlotAvailability = {
  doctorId: string;
  onlineSlot: string;
  physicalSlot: string;
  referenceSlot: string;
  currentDateTime: Date;
  availableInMinutes: number;
};

export type DoctorSlotAvailabilityObject = { [index: string]: DoctorSlotAvailability };

export type FacilityDistanceMap = { [index: string]: string };

let apiCallId: number;
let identifier: string;
let callStartTime: Date;
const getDoctorsBySpecialtyAndFilters: Resolver<
  null,
  { filterInput: FilterDoctorInput },
  DoctorsServiceContext,
  FilterDoctorsResult
> = async (parent, args, { }) => {
  apiCallId = Math.floor(Math.random() * 1000000);
  callStartTime = new Date();
  identifier = args.filterInput.patientId;
  //create first order curried method with first 4 static parameters being passed.
  const searchLogger = debugLog(
    'doctorSearchAPILogger',
    'getDoctorsBySpecialtyAndFilters',
    apiCallId,
    callStartTime,
    identifier
  );
  const facilityDistances: FacilityDistanceMap = {};
  searchLogger(`API_CALL___START`);

  const finalDoctorNextAvailSlots: DoctorSlotAvailability[] = [],
    finalDoctorsConsultModeAvailability: DoctorConsultModeAvailability[] = [];
  let finalSpecialtyDetails;
  let doctors = [];
  const finalSpecialityDetails = [];
  const elasticMatch = [];
  const earlyAvailableApolloDoctors = [],
    earlyAvailableNonApolloDoctors = [],
    docs = [];
  let earlyAvailableStarApolloDoctors = [],
    earlyAvailableNonStarApolloDoctors = [],
    starDoctor = [],
    nonStarDoctor = [];
  let apolloDoctorCount:number = 0,
    partnerDoctorCount:number = 0;

  const facilityIds: string[] = [];
  const facilityLatLongs: number[][] = [];
  args.filterInput.sort = args.filterInput.sort || 'availablity';
  const minsForSort = args.filterInput.sort == 'distance' ? 2881 : 241;
  const pageNo = args.filterInput.pageNo ? args.filterInput.pageNo : 1;
  const pageSize = args.filterInput.pageSize ? args.filterInput.pageSize : 1000;
  const offset = (pageNo - 1) * pageSize;

  const elasticSlotDateAvailability: { [index: string]: any } = [];
 
  if (args.filterInput.availability && args.filterInput.availability.length > 0){
    args.filterInput.availability.forEach((availability) => {
      elasticSlotDateAvailability.push(
        {bool: {must: [
          { match: { 'doctorSlots.slotDate': availability } },
          { match: { 'doctorSlots.slots.slot': availability } },
          { range: { 'doctorSlots.slots.slotThreshold': { gt :'now', lt: availability+'T18:30:00.000Z' } } }
        ]}}
      );
    }); 
  }

  elasticMatch.push({ match: { 'doctorSlots.slots.status': 'OPEN' } });
  elasticMatch.push({ range: { 'doctorSlots.slots.slotThreshold': { gt :'now' } } });

  if (elasticSlotDateAvailability.length > 0 && args.filterInput.availableNow) {
      elasticMatch.push({ bool: { should: [ 
            { bool: { should: elasticSlotDateAvailability }
            },
            { bool: { must: { range: { 'doctorSlots.slots.slotThreshold': { gt : 'now', lte :'now+4h'} } } } }
          ] } } );
  } else if (elasticSlotDateAvailability.length > 0) {
      elasticMatch.push({ bool:{ should: elasticSlotDateAvailability } });
  } else if (args.filterInput.availableNow ) {
    elasticMatch.push({ range: { 'doctorSlots.slots.slotThreshold': { gt :'now', lte :'now+4h'} } });
  }

  if (args.filterInput.specialtyName && args.filterInput.specialtyName.length > 0) {
    elasticMatch.push({ match: { 'specialty.name': args.filterInput.specialtyName.join(',') } });
  }
  if (args.filterInput.specialty) {
    elasticMatch.push({ match_phrase: { 'specialty.specialtyId': args.filterInput.specialty } });
  }
  if (
    (!args.filterInput.specialtyName || args.filterInput.specialtyName.length === 0) &&
    !args.filterInput.specialty
  ) {
    elasticMatch.push({ match: { 'specialty.name': ApiConstants.GENERAL_PHYSICIAN.toString() } });
  }
  if (args.filterInput.experience && args.filterInput.experience.length > 0) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elasticExperience: { [index: string]: any } = [];
    args.filterInput.experience.forEach((experience) => {
      elasticExperience.push({
        range: { experience: { gte: experience.minimum, lte: experience.maximum } },
      });
    });
    if (elasticExperience.length > 0) {
      elasticMatch.push({ bool: { should: elasticExperience } });
    }
  }
  if (args.filterInput.fees && args.filterInput.fees.length > 0) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const elasticFee: { [index: string]: any } = [];
    args.filterInput.fees.forEach((fee) => {
      elasticFee.push({
        range: { onlineConsultationFees: { gte: fee.minimum, lte: fee.maximum } },
      });
    });
    if (elasticFee.length > 0) {
      elasticMatch.push({ bool: { should: elasticFee } });
    }
  }
  if (args.filterInput.gender && args.filterInput.gender.length > 0) {
    elasticMatch.push({ match: { gender: args.filterInput.gender.join(',') } });
  }
  if (args.filterInput.language && args.filterInput.language.length > 0) {
    args.filterInput.language.forEach((language) => {
      elasticMatch.push({ match: { languages: language } });
    });
  }

  if (args.filterInput.doctorType && args.filterInput.doctorType.length > 0) {
    elasticMatch.push({ match: { doctorType: args.filterInput.doctorType.join(',') } });
  }

  if (args.filterInput.city && args.filterInput.city.length) {
    elasticMatch.push({ match: { city: args.filterInput.city.join(',') } });
  }

  elasticMatch.push({ match: { isSearchable: 'true' } });

  if (!process.env.ELASTIC_INDEX_DOCTORS) {
    throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
  }

  const searchParams: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
    body: {
      from: offset,
      size: pageSize,
      query: {
        bool: {
          must: elasticMatch,
        },
      },
      aggs:{
        doctorTypeCount: {
          terms: {
            field: 'doctorType.keyword',
          }
        },
      }
    },
  };
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });

  const getDetails = await client.search(searchParams);
  const doctorTypeCount = getDetails.body.aggregations.doctorTypeCount.buckets;
  for(const doctorCount of doctorTypeCount) {
    if(doctorCount.key === 'DOCTOR_CONNECT'){
      partnerDoctorCount = doctorCount.doc_count;
    } else {
      apolloDoctorCount += doctorCount.doc_count;
    }
  }

  for (const doc of getDetails.body.hits.hits) {
    const doctor = doc._source;
    doctor['id'] = doctor.doctorId;
    doctor['onlineStatus'] = DOCTOR_ONLINE_STATUS.ONLINE;
    doctor['doctorHospital'] = [];
    doctor['openSlotDates'] = [];
    doctor['activeSlotCount'] = 0;
    if (doctor['physicalConsultationFees'] === 0) {
      doctor['physicalConsultationFees'] = doctor['onlineConsultationFees'];
    }
    if (doctor['onlineConsultationFees'] === 0) {
      doctor['onlineConsultationFees'] = doctor['physicalConsultationFees'];
    }
    doctor['availableMode'] = [];
    doctor['earliestSlotavailableInMinutes'] = 0;
    let bufferTime = 5;
    for (const consultHour of doctor.consultHours) {
      consultHour['id'] = consultHour['consultHoursId'];
      bufferTime = consultHour['consultBuffer'];
      if (!doctor['availableMode'].includes(consultHour.consultMode)) {
        doctor['availableMode'].push(consultHour.consultMode);
      }
    }
    if (doctor['availableMode'].length > 1) {
      doctor['availableMode'] = ['BOTH'];
    }
    if (doctor.specialty) {
      doctor.specialty.id = doctor.specialty.specialtyId;
    }
    if (doctor.languages instanceof Array) {
      doctor.languages = doctor.languages.join(', ');
    }
    for (const slots of doc._source.doctorSlots) {
      for (const slot of slots['slots']) {
        if (
          slot.status == 'OPEN' &&
          differenceInMinutes(new Date(slot.slot), callStartTime) > bufferTime
        ) {
          doctor['openSlotDates'].push(slots.slotDate);
          if (doctor['activeSlotCount'] === 0) {
            doctor['earliestSlotavailableInMinutes'] = differenceInMinutes(
              new Date(slot.slot),
              callStartTime
            );
            doctor['earliestSlotavailable'] = new Date(slot.slot);
            finalDoctorNextAvailSlots.push({
              availableInMinutes: Math.abs(differenceInMinutes(callStartTime, new Date(slot.slot))),
              physicalSlot: slot.slotType === 'ONLINE' ? '' : slot.slot,
              currentDateTime: callStartTime,
              doctorId: doc._source.doctorId,
              onlineSlot: slot.slotType === 'PHYSICAL' ? '' : slot.slot,
              referenceSlot: slot.slot,
            });
          }
          doctor['activeSlotCount'] += 1;
        }
      }
    }
    doctor.facility = Array.isArray(doctor.facility) ? doctor.facility : [doctor.facility];
    for (const facility of doctor.facility) {
      if (facilityIds.indexOf(facility.facilityId) === -1) {
        facilityIds.push(facility.facilityId);
        facilityLatLongs.push([facility.latitude, facility.longitude]);
      }
      doctor['doctorHospital'].push({
        facility: {
          name: facility.name,
          facilityType: facility.facilityType,
          streetLine1: facility.streetLine1,
          streetLine2: facility.streetLine2,
          streetLine3: facility.streetLine3,
          city: facility.city,
          state: facility.state,
          zipcode: facility.zipcode,
          imageUrl: facility.imageUrl,
          latitude: facility.latitude,
          longitude: facility.longitude,
          country: facility.country,
          id: facility.facilityId,
        },
      });
    }

    let availability = true;
    if (
      (args.filterInput.availability && args.filterInput.availability.length > 0) ||
      args.filterInput.availableNow
    ) {
      availability = false;
    }
    if (args.filterInput.availability && args.filterInput.availability.length > 0) {
      availability =
        args.filterInput.availability.filter(
          (value) => -1 !== doctor['openSlotDates'].indexOf(value)
        ).length > 0;
    }
    if (
      args.filterInput.availableNow &&
      Math.abs(
        differenceInMinutes(
          new Date(doctor['earliestSlotavailable']),
          new Date(args.filterInput.availableNow)
        )
      ) < 241
    ) {
      availability = true;
    }
    if (doctor['activeSlotCount'] > 0 && availability) {
      if (doctor['earliestSlotavailableInMinutes'] < minsForSort) {
        if (doctor.facility[0].name.includes('Apollo') || doctor.doctorType === 'PAYROLL') {
          if (doctor.doctorType === 'STAR_APOLLO') {
            earlyAvailableStarApolloDoctors.push(doctor);
          } else {
            earlyAvailableNonStarApolloDoctors.push(doctor);
          }
        } else {
          earlyAvailableNonApolloDoctors.push(doctor);
        }
      } else {
        if (doctor.doctorType === 'STAR_APOLLO') {
          starDoctor.push(doctor);
        } else {
          nonStarDoctor.push(doctor);
        }
      }
      finalDoctorsConsultModeAvailability.push({
        availableModes: doctor['availableMode'],
        doctorId: doctor.doctorId,
      });
      finalSpecialityDetails.push(doctor.specialty);
    }
  }
  if (args.filterInput.geolocation && args.filterInput.sort === 'distance') {
    facilityIds.forEach((facilityId: string, index: number) => {
      facilityDistances[facilityId] = distanceBetweenTwoLatLongInMeters(
        facilityLatLongs[index][0],
        facilityLatLongs[index][1],
        args.filterInput.geolocation.latitude,
        args.filterInput.geolocation.longitude
      ).toString();
    });

    for (const doctor of earlyAvailableStarApolloDoctors) {
      earlyAvailableApolloDoctors.push(doctor);
    }
    for (const doctor of earlyAvailableNonStarApolloDoctors) {
      earlyAvailableApolloDoctors.push(doctor);
    }
    for (const doctor of starDoctor) {
      docs.push(doctor);
    }
    for (const doctor of nonStarDoctor) {
      docs.push(doctor);
    }
    doctors = earlyAvailableApolloDoctors
      .sort(
        (a, b) =>
          parseFloat(facilityDistances[a.doctorHospital[0].facility.id]) -
          parseFloat(facilityDistances[b.doctorHospital[0].facility.id])
      )
      .concat(
        earlyAvailableNonApolloDoctors.sort(
          (a, b) =>
            parseFloat(facilityDistances[a.doctorHospital[0].facility.id]) -
            parseFloat(facilityDistances[b.doctorHospital[0].facility.id])
        )
      )
      .concat(
        docs.sort(
          (a, b) =>
            parseFloat(facilityDistances[a.doctorHospital[0].facility.id]) -
            parseFloat(facilityDistances[b.doctorHospital[0].facility.id])
        )
      );
  } else {
    earlyAvailableStarApolloDoctors = earlyAvailableStarApolloDoctors.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );
    earlyAvailableNonStarApolloDoctors = earlyAvailableNonStarApolloDoctors.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );
    let i = 0,
      j = 0;

    while (
      i < earlyAvailableStarApolloDoctors.length ||
      j < earlyAvailableNonStarApolloDoctors.length
    ) {
      if (
        i < earlyAvailableStarApolloDoctors.length &&
        (j >= earlyAvailableNonStarApolloDoctors.length ||
          earlyAvailableStarApolloDoctors[i].earliestSlotavailableInMinutes <=
          earlyAvailableNonStarApolloDoctors[j].earliestSlotavailableInMinutes)
      ) {
        earlyAvailableApolloDoctors.push(earlyAvailableStarApolloDoctors[i]);
        i++;
      } else if (j < earlyAvailableNonStarApolloDoctors.length) {
        earlyAvailableApolloDoctors.push(earlyAvailableNonStarApolloDoctors[j]);
        j++;
      }
    }
    starDoctor = starDoctor.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );
    nonStarDoctor = nonStarDoctor.sort(
      (a, b) =>
        parseFloat(a.earliestSlotavailableInMinutes) - parseFloat(b.earliestSlotavailableInMinutes)
    );

    (i = 0), (j = 0);
    while (i < starDoctor.length || j < nonStarDoctor.length) {
      if (
        i < starDoctor.length &&
        (j >= nonStarDoctor.length ||
          starDoctor[i].earliestSlotavailableInMinutes <=
          nonStarDoctor[j].earliestSlotavailableInMinutes)
      ) {
        docs.push(starDoctor[i]);
        i++;
      } else {
        docs.push(nonStarDoctor[j]);
        j++;
      }
    }
    doctors = earlyAvailableApolloDoctors
      .concat(
        earlyAvailableNonApolloDoctors.sort(
          (a, b) =>
            parseFloat(a.earliestSlotavailableInMinutes) -
            parseFloat(b.earliestSlotavailableInMinutes)
        )
      )
      .concat(docs);
  }

  const searchFilters: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
    body: {
      size: 0,
      aggs: {
        brands: {
          terms: {
            field: "doctorType.keyword",
            size: 10000,
            order: {"_term": "asc"}
          }
        },
        state: {
          terms: {
            field: "facility.state.keyword",
            size: 10000,
            min_doc_count: 1,
            order: {"_term": "asc"}
          },
          aggs: {
            city: {
              terms: {
                field: "facility.city.keyword",
                size: 10000,
                min_doc_count: 1,
                order: {"_term": "asc"}
              }
            }
          }
        },
        language: {
          terms: {
            field: "languages.keyword",
            size: 10000,
            min_doc_count: 1,
            order: {"_term": "asc"}
          }
        },
        experience: {
          terms: {
            field: "experience_range.keyword",
            size: 10000,
            order: {"_term": "asc"}
          }
        },
        fee: {
          terms: {
            field: "fee_range.keyword",
            size: 10000,
            order: {"_term": "asc"}
          }
        },
        gender: {
          terms: {
            field: "gender.keyword",
            size: 10000,
            order: {"_term": "asc"}
          }
        }
      }
    }
  };

  const aggnData = await client.search(searchFilters);

  function ifKeyExist(arr: any[], key: string, value: string) {
    if (arr.length) {
      arr = arr.filter((elem: any) => {
        return elem[key] === value
      });
      if (arr.length) {
        return arr[0];
      }
      return {};
    } else {
      return {};
    }
  }

  function capitalize(input: string) {
    const words = input.split('_');
    const CapitalizedWords: string[] = [];
    words.forEach((element: string) => {
      if(element.length >=1){
        CapitalizedWords.push(element[0].toUpperCase() + element.slice(1, element.length).toLowerCase());
      }
    });
    return CapitalizedWords.join(' ');
  }

  const filters: any = { city: [], brands: [], language: [], experience: [], availability: [], fee: [], gender: [] };

  function pushInFilters(esObject: any, field: string){
    esObject[field]['buckets'].forEach((element: { key: 'string', doc_count: number }) => {
      if(element['key'] && !("name" in ifKeyExist(filters[field], 'name', capitalize(element['key'])))){
        if(field != 'brands'){
          filters[field].push({ name: capitalize(element['key']) });
        } else {
          filters[field].push({ name: element['key'], brandName: capitalize(element['key']), image: '' });
        }
      }
    });
  }

  pushInFilters(aggnData.body.aggregations, 'brands');
  pushInFilters(aggnData.body.aggregations, 'language');
  pushInFilters(aggnData.body.aggregations, 'gender');
  pushInFilters(aggnData.body.aggregations, 'fee');
  pushInFilters(aggnData.body.aggregations, 'experience');

  aggnData.body.aggregations.state.buckets.forEach((state: any) => {
    if(state['key'] && !("name" in ifKeyExist(filters['city'], 'state', capitalize(state['key'])))){
      const cityObject: { state: string, data: string[] } = {state: '', data: [] };
      state.city.buckets.forEach((city:any) => {
        if(city['key'] && !cityObject.data.includes(capitalize(city['key']))){
          cityObject.data.push(capitalize(city['key']));
        }
      });
      cityObject.state = capitalize(state['key']);
      filters.city.push(cityObject);
    }
  });

  filters.availability = [{ 'name': 'Now' }, { 'name': 'Today' }, { 'name': 'Tomorrow' }, { 'name': 'Next 3 Days' }]

  function rangeCompare(field: string, order: string = 'asc') {
    return function sort(objectA: any, objectB: any) {
      if (!objectA.hasOwnProperty(field) || !objectB.hasOwnProperty(field)) {
        return 0;
      }
      const fieldA = parseInt(objectA[field].split("-")[0], 10);
      const fieldB = parseInt(objectB[field].split("-")[0], 10);
      let comparison = 0;
      if (fieldA > fieldB) {
        comparison = 1;
      } else if (fieldA < fieldB) {
        comparison = -1;
      }
      return (
        (order === 'desc') ? (comparison * -1) : comparison
      );
    };
  }
  
  filters.experience.sort(rangeCompare('name'));
  filters.fee.sort(rangeCompare('name'));

  searchLogger(`API_CALL___END`);
  return {
    doctors: doctors,
    doctorsNextAvailability: finalDoctorNextAvailSlots,
    doctorsAvailability: finalDoctorsConsultModeAvailability,
    specialty: finalSpecialtyDetails,
    sort: args.filterInput.sort,
    filters: filters,
    apolloDoctorCount,
    partnerDoctorCount
  };
};

export const getDoctorsBySpecialtyAndFiltersTypeDefsResolvers = {
  Query: {
    getDoctorsBySpecialtyAndFilters,
  },
};
