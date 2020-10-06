import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { differenceInDays, addDays, format } from 'date-fns';
import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
import { ES_DOCTOR_SLOT_STATUS } from 'consults-service/entities';
import { Doctor } from 'doctors-service/entities';
import { addDoctorElastic } from 'doctors-service/entities/doctorElastic';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { AphError } from 'AphError';

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

  if (!process.env.ELASTIC_INDEX_DOCTORS) {
    throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
  }

  const deleteParams: RequestParams.Delete = {
    id: args.id,
    index: process.env.ELASTIC_INDEX_DOCTORS,
  };
  const delResp = await client.delete(deleteParams);
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

      if (!process.env.ELASTIC_INDEX_DOCTORS) {
        throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
      }

      const doc1: RequestParams.Update = {
        index: process.env.ELASTIC_INDEX_DOCTORS,
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
    });
  }
  client.close();
  return 'slot status updated ' + slotsUpdated;
};

const updateDoctorSlotStatus: Resolver<
  null,
  { id: string; slotDate: string; slot: string; status: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });

  if (!process.env.ELASTIC_INDEX_DOCTORS) {
    throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
  }

  const doc1: RequestParams.Update = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
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
  client.close();
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

      if (!process.env.ELASTIC_INDEX_DOCTORS) {
        throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
      }

      const searchParams: RequestParams.Search = {
        index: process.env.ELASTIC_INDEX_DOCTORS,
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
      if (getDetails.body.hits.hits.length == 0) {
        await addDoctorElastic(allDocsInfo[k]);
      } else {

        if (!process.env.ELASTIC_INDEX_DOCTORS) {
          throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
        }

        const deleteParams: RequestParams.Delete = {
          id: allDocsInfo[k].id,
          index: process.env.ELASTIC_INDEX_DOCTORS,
        };
        const delResp = await client.delete(deleteParams);
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
          index: process.env.ELASTIC_INDEX_DOCTORS,
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
        stDate = addDays(stDate, 1);
      }
    }
    slotsAdded += '},';
  }
  client.close();
  return 'done ' + slotsAdded;
};

const addDoctorSlotsElastic: Resolver<
  null,
  { id: string; slotDate: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb, consultsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });

  if (!process.env.ELASTIC_INDEX_DOCTORS) {
    throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
  }

  const searchParams: RequestParams.Search = {
    index: process.env.ELASTIC_INDEX_DOCTORS,
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

  if (getDetails.body.hits.hits.length == 0) {
    const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
    const doctorSlots = await docRepo.getDoctorSlots(
      new Date(args.slotDate),
      args.id,
      consultsDb,
      doctorsDb
    );

    if (!process.env.ELASTIC_INDEX_DOCTORS) {
      throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
    }

    const doc1: RequestParams.Update = {
      index: process.env.ELASTIC_INDEX_DOCTORS,
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
  }
  client.close();
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

    if (!process.env.ELASTIC_INDEX_DOCTORS) {
      throw new AphError(AphErrorMessages.ELASTIC_INDEX_NAME_MISSING);
    }

    for (let i = 0; i < allDocsInfo.length; i++) {
      const searchParams: RequestParams.Search = {
        index: process.env.ELASTIC_INDEX_DOCTORS,
        body: {
          query: {
            match_phrase: {
              doctorId: allDocsInfo[i].id,
            },
          },
        },
      };
      const getDetails = await client.search(searchParams);
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
  client.close();
  return 'Elastic search query. NewdocData: ' + newDocData + ' ExtDocdata: ' + extDocData;
};

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
