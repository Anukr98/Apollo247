import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { differenceInDays, addDays, format } from 'date-fns';

export const doctorDataElasticTypeDefs = gql`
  extend type Mutation {
    insertDataElastic(id: String, limit: Int, offset: Int): String
    deleteDocumentElastic(id: String): String
    addDoctorSlotsElastic(id: String, slotDate: String): String
    updateDoctorSlotStatus(id: String, slotDate: String, slot: String, status: String): String
    addAllDoctorSlotsElastic(
      limit: Int
      offset: Int
      fromSlotDate: String
      toSlotDate: String
    ): String
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
  { limit: number; offset: number; fromSlotDate: string; toSlotDate: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb }) => {
  let stDate = new Date(args.fromSlotDate);
  const daysDiff = Math.abs(differenceInDays(new Date(args.toSlotDate), stDate));
  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const allDocsInfo = await docRepo.getAllDoctorsInfo('0', args.limit, args.offset);
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  let slotsAdded = '';
  if (allDocsInfo.length > 0) {
    for (let k = 0; k < allDocsInfo.length; k++) {
      stDate = new Date(args.fromSlotDate);
      slotsAdded += '{';
      for (let i = 0; i <= daysDiff; i++) {
        //str += format(stDate, 'yyyy-MM-dd') + ',';
        const searchParams: RequestParams.Search = {
          index: 'doctors',
          type: 'posts',
          body: {
            query: {
              bool: {
                must: [
                  {
                    match: {
                      'doctorSlots.slotDate': format(stDate, 'yyyy-MM-dd'),
                    },
                  },
                  {
                    match: {
                      doctorId: allDocsInfo[k].id,
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
          const doctorSlots = await docRepo.getDoctorSlots(
            new Date(format(stDate, 'yyyy-MM-dd')),
            allDocsInfo[k].id
          );
          //console.log(doctorSlots, 'doctor slots');
          const doc1: RequestParams.Update = {
            index: 'doctors',
            type: 'posts',
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
        }
        stDate = addDays(stDate, 1);
      }
      slotsAdded += '},';
    }
  }
  return 'done ' + slotsAdded;
};

const addDoctorSlotsElastic: Resolver<
  null,
  { id: string; slotDate: string },
  DoctorsServiceContext,
  string
> = async (parent, args, { doctorsDb }) => {
  const client = new Client({ node: process.env.ELASTIC_CONNECTION_URL });
  const searchParams: RequestParams.Search = {
    index: 'doctors',
    type: 'posts',
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
              match: {
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
    const doctorSlots = await docRepo.getDoctorSlots(new Date(args.slotDate), args.id);
    //console.log(doctorSlots, 'doctor slots');
    const doc1: RequestParams.Update = {
      index: 'doctors',
      type: 'posts',
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
            match: {
              mobileNumber: allDocsInfo[i].mobileNumber,
            },
          },
        },
      };
      const getDetails = await client.search(searchParams);

      console.log(getDetails.body.hits.hits, getDetails.body.hits.hits.length, 'hitCount');
      if (getDetails.body.hits.hits.length == 0) {
        newDocData += allDocsInfo[i].mobileNumber + ',';
        const consultHours = [];
        for (let k = 0; k < allDocsInfo[i].consultHours.length; k++) {
          const hourData = {
            consultHoursId: allDocsInfo[i].consultHours[k].id,
            weekDay: allDocsInfo[i].consultHours[k].weekDay,
            startTime: allDocsInfo[i].consultHours[k].startTime,
            endTime: allDocsInfo[i].consultHours[k].endTime,
            consultMode: allDocsInfo[i].consultHours[k].consultMode,
            consultDuration: allDocsInfo[i].consultHours[k].consultDuration,
            consultBuffer: allDocsInfo[i].consultHours[k].consultBuffer,
            actualDay: allDocsInfo[i].consultHours[k].actualDay,
            slotsPerHour: allDocsInfo[i].consultHours[k].slotsPerHour,
            isActive: allDocsInfo[i].consultHours[k].isActive,
            consultType: allDocsInfo[i].consultHours[k].consultType,
          };
          consultHours.push(hourData);
        }
        let doctorSecratry = {};
        let facility = {};
        let specialty = {};
        if (allDocsInfo[i].doctorSecretary) {
          doctorSecratry = {
            docSecretaryId: allDocsInfo[i].doctorSecretary.id,
            name: allDocsInfo[i].doctorSecretary.secretary.name,
            mobileNumber: allDocsInfo[i].doctorSecretary.secretary.mobileNumber,
            isActive: allDocsInfo[i].doctorSecretary.secretary.isActive,
            secretaryId: allDocsInfo[i].doctorSecretary.secretary.id,
          };
        }
        if (allDocsInfo[i].doctorHospital.length > 0) {
          facility = {
            docFacilityId: allDocsInfo[i].doctorHospital[0].id,
            name: allDocsInfo[i].doctorHospital[0].facility.name,
            facilityType: allDocsInfo[i].doctorHospital[0].facility.facilityType,
            streetLine1: allDocsInfo[i].doctorHospital[0].facility.streetLine1,
            streetLine2: allDocsInfo[i].doctorHospital[0].facility.streetLine2,
            streetLine3: allDocsInfo[i].doctorHospital[0].facility.streetLine3,
            city: allDocsInfo[i].doctorHospital[0].facility.city,
            state: allDocsInfo[i].doctorHospital[0].facility.state,
            zipcode: allDocsInfo[i].doctorHospital[0].facility.zipcode,
            imageUrl: allDocsInfo[i].doctorHospital[0].facility.imageUrl,
            latitude: allDocsInfo[i].doctorHospital[0].facility.latitude,
            longitude: allDocsInfo[i].doctorHospital[0].facility.longitude,
            country: allDocsInfo[i].doctorHospital[0].facility.country,
            facilityId: allDocsInfo[i].doctorHospital[0].facility.id,
          };
        }
        if (allDocsInfo[i].specialty) {
          specialty = {
            specialtyId: allDocsInfo[i].specialty.id,
            name: allDocsInfo[i].specialty.name,
            image: allDocsInfo[i].specialty.image,
            specialistSingularTerm: allDocsInfo[i].specialty.specialistSingularTerm,
            specialistPluralTerm: allDocsInfo[i].specialty.specialistPluralTerm,
            userFriendlyNomenclature: allDocsInfo[i].specialty.userFriendlyNomenclature,
          };
        }
        //console.log(allDocsInfo[i].doctorSecretary.id, 'specialty dets');
        const doctorData = {
          doctorId: allDocsInfo[i].id,
          firstName: allDocsInfo[i].firstName,
          lastName: allDocsInfo[i].lastName,
          mobileNumber: allDocsInfo[i].mobileNumber,
          awards: allDocsInfo[i].awards,
          city: allDocsInfo[i].city,
          country: allDocsInfo[i].country,
          dateOfBirth: allDocsInfo[i].dateOfBirth,
          displayName: allDocsInfo[i].displayName,
          doctorType: allDocsInfo[i].doctorType,
          delegateName: allDocsInfo[i].delegateName,
          delegateNumber: allDocsInfo[i].delegateNumber,
          emailAddress: allDocsInfo[i].emailAddress,
          externalId: allDocsInfo[i].externalId,
          fullName: allDocsInfo[i].fullName,
          experience: allDocsInfo[i].experience,
          gender: allDocsInfo[i].gender,
          isActive: allDocsInfo[i].isActive,
          languages: allDocsInfo[i].languages,
          middleName: allDocsInfo[i].middleName,
          onlineConsultationFees: allDocsInfo[i].onlineConsultationFees,
          photoUrl: allDocsInfo[i].photoUrl,
          physicalConsultationFees: allDocsInfo[i].physicalConsultationFees,
          qualification: allDocsInfo[i].qualification,
          registrationNumber: allDocsInfo[i].registrationNumber,
          salutation: allDocsInfo[i].salutation,
          signature: allDocsInfo[i].signature,
          specialization: allDocsInfo[i].specialization,
          state: allDocsInfo[i].state,
          streetLine1: allDocsInfo[i].streetLine1,
          streetLine2: allDocsInfo[i].streetLine2,
          streetLine3: allDocsInfo[i].streetLine3,
          thumbnailUrl: allDocsInfo[i].thumbnailUrl,
          zip: allDocsInfo[i].zip,
          specialty,
          facility,
          consultHours,
          doctorSecratry,
          doctorSlots: [],
        };
        console.log(doctorData, 'doc data');
        const resp: ApiResponse = await client.index({
          index: 'doctors',
          id: allDocsInfo[i].id,
          body: doctorData,
        });
        console.log(resp, 'index resp');
      } else {
        extDocData += allDocsInfo[i].id + ',';
      }
    }
  }
  //await client.index(doc1);
  //await client.update(doc1);

  return 'Elastic search query. NewdocData: ' + newDocData + ' ExtDocdata: ' + extDocData;
};

export const doctorDataElasticResolvers = {
  Mutation: {
    insertDataElastic,
    deleteDocumentElastic,
    addDoctorSlotsElastic,
    updateDoctorSlotStatus,
    addAllDoctorSlotsElastic,
  },
};
