import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { DoctorsServiceContext } from 'doctors-service/doctorsServiceContext';
import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
import { ConsultHours } from 'doctors-service/entities/';
import { CloudConnectionPool } from '@elastic/elasticsearch/lib/pool';

export const doctorDataElasticTypeDefs = gql`
  extend type Mutation {
    insertDataElastic(id: String): String
    deleteDocumentElastic(id: String): String
  }
`;

const deleteDocumentElastic: Resolver<null, { id: string }, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const client = new Client({ node: 'http://104.211.242.175:9200' });
  const deleteParams: RequestParams.Delete = {
    id: args.id,
    index: 'doctors',
  };
  const delResp = await client.delete(deleteParams);
  console.log(delResp, 'delete resp');
  return 'Document deleted';
};

const insertDataElastic: Resolver<null, { id: string }, DoctorsServiceContext, string> = async (
  parent,
  args,
  { doctorsDb }
) => {
  const client = new Client({ node: 'http://104.211.242.175:9200' });

  const docRepo = doctorsDb.getCustomRepository(DoctorRepository);
  const allDocsInfo = await docRepo.getAllDoctorsInfo(args.id);
  let extDocData = '',
    newDocData = '';
  if (allDocsInfo.length > 0) {
    for (let i = 0; i < 1; i++) {
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
        if (allDocsInfo[i].doctorSecretary) {
          doctorSecratry = {
            docSecretaryId: allDocsInfo[i].doctorSecretary.id,
            name: allDocsInfo[i].doctorSecretary.secretary.name,
            mobileNumber: allDocsInfo[i].doctorSecretary.secretary.mobileNumber,
            isActive: allDocsInfo[i].doctorSecretary.secretary.isActive,
            secretaryId: allDocsInfo[i].doctorSecretary.secretary.id,
          };
        }
        //console.log(allDocsInfo[i].doctorSecretary.id, 'specialty dets');
        const doctorData = {
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
          specialty: {
            specialtyId: allDocsInfo[i].specialty.id,
            name: allDocsInfo[i].specialty.name,
            image: allDocsInfo[i].specialty.image,
            specialistSingularTerm: allDocsInfo[i].specialty.specialistSingularTerm,
            specialistPluralTerm: allDocsInfo[i].specialty.specialistPluralTerm,
            userFriendlyNomenclature: allDocsInfo[i].specialty.userFriendlyNomenclature,
          },
          facility: [
            {
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
            },
          ],
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
        extDocData += allDocsInfo[i].mobileNumber + ',';
      }
    }
  }
  //await client.index(doc1);
  //await client.update(doc1);

  return 'Elastic search query. NewdocData: ' + newDocData + ' ExtDocdata: ' + extDocData;
};
//insert data features ends here

export const doctorDataElasticResolvers = {
  Mutation: { insertDataElastic, deleteDocumentElastic },
};
