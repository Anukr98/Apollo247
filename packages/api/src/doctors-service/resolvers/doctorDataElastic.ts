import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { differenceInDays, addDays, format } from 'date-fns';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ES_DOCTOR_SLOT_STATUS } from 'consults-service/entities';
import { Doctor } from 'doctors-service/entities';

export const doctorDataElasticTypeDefs = gql`
  extend type Mutation {
    insertDataElastic(id: String, limit: Int, offset: Int): String
    deleteDocumentElastic(id: String): String
    addDoctorSlotsElastic(id: String, slotDate: String): String
    updateDoctorSlotStatus(id: String, slotDate: String, slot: String, status: String): String
    addAllDoctorSlotsElastic(
      id: String
      limit: Int
      offset: Int
      fromSlotDate: String
      toSlotDate: String
    ): String
    updateApptDoctorSlotStatus(id: String, slotDate: Date): String
  }
`;

const deleteDocumentElastic: Resolver<null, { id: string }, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const deleteParams: RequestParams.Delete = {
    id: args.id,
    index: 'doctors',
  };
  const delResp = await client.delete(deleteParams);
  console.log(delResp, 'delete resp');
  return 'Document deleted';
};

const updateApptDoctorSlotStatus: Resolver<
  null,
  { id: string; slotDate: Date },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb, consultsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const appts = consultsDb.getCustomRepository(AppointmentRepository);
  const apptSlots = await appts.getAllDoctorAppointments(args.id, args.slotDate);
  let slotsUpdated = '';
  if (apptSlots && apptSlots.length > 0) {
    apptSlots.map(async (appt) => {
      const apptDt = format(appt.appointmentDateTime, 'yyyy-MM-dd');
      const sl = `${apptDt}T${appt.appointmentDateTime
        .getUTCHours()
        .toString()
        .padStart(2, '0')}:${appt.appointmentDateTime
        .getUTCMinutes()
        .toString()
        .padStart(2, '0')}:00.000Z`;
      const doc1: RequestParams.Update = {
        index: 'doctors',
        type: 'posts',
        id: appt.doctorId,
        body: {
          script: {
            source:
              'for (int i = 0; i < ctx._source.doctorSlots.length; ++i) { if(ctx._source.doctorSlots[i].slotDate == params.slotDate) { for(int k=0;k<ctx._source.doctorSlots[i].slots.length;k++){if(ctx._source.doctorSlots[i].slots[k].slot == params.slot){ ctx._source.doctorSlots[i].slots[k].status = params.status;}}}}',
            params: {
              slotDate: apptDt,
              slot: sl,
              status: ES_DOCTOR_SLOT_STATUS.BOOKED,
            },
          },
        },
      };
      slotsUpdated += '{' + appt.doctorId + ' - ' + sl + '},';
      const updateResp = await client.update(doc1);
      console.log(updateResp, 'updateResp');
    });
  }
  return 'slot status updated ' + slotsUpdated;
};

const updateDoctorSlotStatus: Resolver<
  null,
  { id: string; slotDate: string; slot: string; status: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const doc1: RequestParams.Update = {
    index: 'doctors',
    type: 'posts',
    id: args.id,
    body: {
      script: {
        source:
          'for (int i = 0; i < ctx._source.doctorSlots.length; ++i) { if(ctx._source.doctorSlots[i].slotDate == params.slotDate) { for(int k=0;k<ctx._source.doctorSlots[i].slots.length;k++){if(ctx._source.doctorSlots[i].slots[k].slot == params.slot){ ctx._source.doctorSlots[i].slots[k].status = params.status;}}}}',
        params: {
          slotDate: args.slotDate,
          slot: args.slot,
          status: args.status,
        },
      },
    },
  };
  const updateResp = await client.update(doc1);
  console.log(updateResp, 'updateResp');
  return 'slot status updated ' + args.id;
};

const addAllDoctorSlotsElastic: Resolver<
  null,
  { id: string; limit: number; offset: number; fromSlotDate: string; toSlotDate: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb, consultsDb }) => {
  let stDate = new Date(args.fromSlotDate);
  const daysDiff = Math.abs(differenceInDays(new Date(args.toSlotDate), stDate));
  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const allDocsInfo = await docRepo.getAllDoctorsInfo(args.id, args.limit, args.offset);
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  let slotsAdded = '';
  if (allDocsInfo.length > 0) {
    for (let k = 0; k < allDocsInfo.length; k++) {
      stDate = new Date(args.fromSlotDate);
      slotsAdded += '{';
      console.log('came here');
      const searchParams: RequestParams.Search = {
        index: 'doctors',
        type: 'posts',
        body: {
          query: {
            match_phrase: {
              doctorId: allDocsInfo[k].id,
            },
          },
        },
      };
      const getDetails = await client.search(searchParams);

      console.log(getDetails.body.hits.hits, getDetails.body.hits.hits.length, 'hitCount');
      if (getDetails.body.hits.hits.length == 0) {
        await addDoctorElastic(allDocsInfo[k]);
      } else {
        const deleteParams: RequestParams.Delete = {
          id: allDocsInfo[k].id,
          index: 'doctors',
        };
        const delResp = await client.delete(deleteParams);
        console.log(delResp, 'delete resp');
        await addDoctorElastic(allDocsInfo[k]);
      }
      for (let i = 0; i <= daysDiff; i++) {
        const doctorSlots = await docRepo.getDoctorSlots(
          new Date(format(stDate, 'yyyy-MM-dd')),
          allDocsInfo[k].id,
          consultsDb,
          doctorsDb
        );
        //console.log(doctorSlots, 'doctor slots');
        const doc1: RequestParams.Update = {
          index: 'doctors',
          id: allDocsInfo[k].id,
          body: {
            script: {
              source: 'ctx._source.doctorSlots.add(params.slot)',
              params: {
                slot: {
                  slotDate: format(stDate, 'yyyy-MM-dd'),
                  slots: doctorSlots,
                },
              },
            },
          },
        };
        slotsAdded += allDocsInfo[k].id + ' - ' + format(stDate, 'yyyy-MM-dd') + ',';
        const updateResp = await client.update(doc1);
        console.log(updateResp, 'updateResp');
        stDate = addDays(stDate, 1);
      }
    }
    slotsAdded += '},';
  }
  return 'done ' + slotsAdded;
};

const addDoctorSlotsElastic: Resolver<
  null,
  { id: string; slotDate: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb, consultsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const searchParams: RequestParams.Search = {
    index: 'doctors',
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                'doctorSlots.slotDate': args.slotDate,
              },
            },
            {
              match_phrase: {
                doctorId: args.id,
              },
            },
          ],
        },
      },
    },
  };
  const getDetails = await client.search(searchParams);

  console.log(getDetails.body.hits.hits, getDetails.body.hits.hits.length, 'searchhitCount');

  if (getDetails.body.hits.hits.length == 0) {
    const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctorSlots = await docRepo.getDoctorSlots(
      new Date(args.slotDate),
      args.id,
      consultsDb,
      doctorsDb
    );
    console.log(doctorSlots, 'doctor slots');
    const doc1: RequestParams.Update = {
      index: 'doctors',
      id: args.id,
      body: {
        script: {
          source: 'ctx._source.doctorSlots.add(params.slot)',
          params: {
            slot: {
              slotDate: args.slotDate,
              slots: doctorSlots,
            },
          },
        },
      },
    };
    const updateResp = await client.update(doc1);
    console.log(updateResp, 'updateResp');
  }
  return 'Document updated: ' + args.id;
};

const insertDataElastic: Resolver<
  null,
  { id: string; limit: number; offset: number },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });

  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const allDocsInfo = await docRepo.getAllDoctorsInfo(args.id, args.limit, args.offset);
  let extDocData = '',
    newDocData = '';
  if (allDocsInfo.length > 0) {
    for (let i = 0; i < allDocsInfo.length; i++) {
      const searchParams: RequestParams.Search = {
        index: 'doctors',
        type: 'posts',
        body: {
          query: {
            match_phrase: {
              doctorId: allDocsInfo[i].id,
            },
          },
        },
      };
      const getDetails = await client.search(searchParams);

      console.log(getDetails.body.hits.hits, getDetails.body.hits.hits.length, 'hitCount');
      if (getDetails.body.hits.hits.length == 0) {
        newDocData += allDocsInfo[i].id + ',';
        await addDoctorElastic(allDocsInfo[i]);
      } else {
        extDocData += allDocsInfo[i].id + ',';
      }
    }
  }
  //await client.index(doc1);
  //await client.update(doc1);

  return 'Elastic search query. NewdocData: ' + newDocData + ' ExtDocdata: ' + extDocData;
};

async function addDoctorElastic(allDocsInfo: Doctor) {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const consultHours = [];
  for (let k = 0; k < allDocsInfo.consultHours.length; k++) {
    const hourData = {
      consultHoursId: allDocsInfo.consultHours[k].id,
      weekDay: allDocsInfo.consultHours[k].weekDay,
      startTime: allDocsInfo.consultHours[k].startTime,
      endTime: allDocsInfo.consultHours[k].endTime,
      consultMode: allDocsInfo.consultHours[k].consultMode,
      consultDuration: allDocsInfo.consultHours[k].consultDuration,
      consultBuffer: allDocsInfo.consultHours[k].consultBuffer,
      actualDay: allDocsInfo.consultHours[k].actualDay,
      slotsPerHour: allDocsInfo.consultHours[k].slotsPerHour,
      isActive: allDocsInfo.consultHours[k].isActive,
      consultType: allDocsInfo.consultHours[k].consultType,
    };
    consultHours.push(hourData);
  }
  let doctorSecratry = {};
  let specialty = {};
  const facility = [];
  if (allDocsInfo.doctorSecretary) {
    doctorSecratry = {
      docSecretaryId: allDocsInfo.doctorSecretary.id,
      name: allDocsInfo.doctorSecretary.secretary.name,
      mobileNumber: allDocsInfo.doctorSecretary.secretary.mobileNumber,
      isActive: allDocsInfo.doctorSecretary.secretary.isActive,
      secretaryId: allDocsInfo.doctorSecretary.secretary.id,
    };
  }
  if (allDocsInfo.doctorHospital.length > 0) {
    for (let f = 0; f < allDocsInfo.doctorHospital.length; f++) {
      const location = {
        lat: allDocsInfo.doctorHospital[f].facility.latitude,
        lon: allDocsInfo.doctorHospital[f].facility.longitude,
      };
      const facilityData = {
        docFacilityId: allDocsInfo.doctorHospital[f].id,
        name: allDocsInfo.doctorHospital[f].facility.name,
        facilityType: allDocsInfo.doctorHospital[f].facility.facilityType,
        streetLine1: allDocsInfo.doctorHospital[f].facility.streetLine1,
        streetLine2: allDocsInfo.doctorHospital[f].facility.streetLine2,
        streetLine3: allDocsInfo.doctorHospital[f].facility.streetLine3,
        city: allDocsInfo.doctorHospital[f].facility.city,
        state: allDocsInfo.doctorHospital[f].facility.state,
        zipcode: allDocsInfo.doctorHospital[f].facility.zipcode,
        imageUrl: allDocsInfo.doctorHospital[f].facility.imageUrl,
        latitude: allDocsInfo.doctorHospital[f].facility.latitude,
        longitude: allDocsInfo.doctorHospital[f].facility.longitude,
        country: allDocsInfo.doctorHospital[f].facility.country,
        facilityId: allDocsInfo.doctorHospital[f].facility.id,
        location,
      };
      facility.push(facilityData);
    }
  }
  if (allDocsInfo.specialty) {
    specialty = {
      specialtyId: allDocsInfo.specialty.id,
      name: allDocsInfo.specialty.name,
      image: allDocsInfo.specialty.image,
      specialistSingularTerm: allDocsInfo.specialty.specialistSingularTerm,
      specialistPluralTerm: allDocsInfo.specialty.specialistPluralTerm,
      userFriendlyNomenclature: allDocsInfo.specialty.userFriendlyNomenclature,
    };
  }
  //console.log(allDocsInfo.doctorSecretary.id, 'specialty dets');
  const doctorData = {
    doctorId: allDocsInfo.id,
    firstName: allDocsInfo.firstName,
    lastName: allDocsInfo.lastName,
    mobileNumber: allDocsInfo.mobileNumber,
    awards: allDocsInfo.awards,
    city: allDocsInfo.city,
    country: allDocsInfo.country,
    dateOfBirth: allDocsInfo.dateOfBirth,
    displayName: allDocsInfo.displayName,
    doctorType: allDocsInfo.doctorType,
    delegateName: allDocsInfo.delegateName,
    delegateNumber: allDocsInfo.delegateNumber,
    emailAddress: allDocsInfo.emailAddress,
    externalId: allDocsInfo.externalId,
    fullName: allDocsInfo.fullName,
    experience: allDocsInfo.experience,
    gender: allDocsInfo.gender,
    isActive: allDocsInfo.isActive,
    languages: allDocsInfo.languages,
    middleName: allDocsInfo.middleName,
    onlineConsultationFees: allDocsInfo.onlineConsultationFees,
    photoUrl: allDocsInfo.photoUrl,
    physicalConsultationFees: allDocsInfo.physicalConsultationFees,
    qualification: allDocsInfo.qualification,
    registrationNumber: allDocsInfo.registrationNumber,
    salutation: allDocsInfo.salutation,
    signature: allDocsInfo.signature,
    specialization: allDocsInfo.specialization,
    state: allDocsInfo.state,
    streetLine1: allDocsInfo.streetLine1,
    streetLine2: allDocsInfo.streetLine2,
    streetLine3: allDocsInfo.streetLine3,
    thumbnailUrl: allDocsInfo.thumbnailUrl,
    zip: allDocsInfo.zip,
    specialty,
    facility,
    consultHours,
    doctorSecratry,
    doctorSlots: [],
  };
  //console.log(doctorData, 'doc data');
  const resp: ApiResponse = await client.index({
    index: 'doctors',
    id: allDocsInfo.id,
    body: doctorData,
  });
  console.log(resp, 'index resp');
}

export const doctorDataElasticResolvers = {
  Mutation: {
    insertDataElastic,
    deleteDocumentElastic,
    addDoctorSlotsElastic,
    updateDoctorSlotStatus,
    addAllDoctorSlotsElastic,
    updateApptDoctorSlotStatus,
  },
};
