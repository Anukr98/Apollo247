// import gql from 'graphql-tag';
// import { log } from 'customWinstonLogger';
// import { Resolver } from 'api-gateway';
// import { ConsultServiceContext } from 'consults-service/consultServiceContext';
// import { AphError } from 'AphError';
// import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
// import { AppointmentRepository } from 'consults-service/repositories/appointmentRepository';
// import { DoctorRepository } from 'doctors-service/repositories/doctorRepository';
// import { PatientRepository } from 'profiles-service/repositories/patientRepository';
// import { ExotelDetailsRepository } from 'consults-service/repositories/exotelDetailsRepository';
// import { uploadFileToBlobStorage } from 'helpers/uploadFileToBlob';
// import { DEVICETYPE, Appointment } from 'consults-service/entities';
// import { ApiConstants } from 'ApiConstants';

// export const exotelTypeDefs = gql`
//   input exotelInput {
//     from: String
//     to: String
//     appointmentId: String!
//     deviceType: DEVICETYPE
//   }

//   type exotelResult {
//     isError: Boolean
//     from: String
//     to: String
//     response: String
//     errorMessage: String
//   }

//   input callStatusInput {
//     status: String
//   }

//   type callStatusResult {
//     updatedCallSidArray: [String]
//     errorArray: String
//   }

//   input appointment {
//     id: String
//   }

//   type callDetails {
//     callSid: String
//     callEndTime: String
//     callStartTime: String
//     patientPickedUp: String
//     doctorPickedUp: String
//     totalCallDuration: String
//     deviceType: String
//     recordingUrl: String
//     appointment: Appointment
//     status: String
//   }

//   type callDetailsResult {
//     calls: [callDetails!]!
//   }

//   extend type Query {
//     initateConferenceTelephoneCall(exotelInput: exotelInput): exotelResult!
//     getCallDetailsByAppintment(appointment: appointment): callDetailsResult!
//   }
//   extend type Mutation {
//     updateCallStatusBySid(callStatusInput: callStatusInput): callStatusResult
//   }
// `;

// // updateProfile



// type callStatusInput = {
//     status: string;
// };
  
// type callStatusResult = {
//     updatedCallSidArray: string[];
//     errorArray: string;
// };

// type callStatusInputArgs = { callStatusInput: callStatusInput };

// const updateCallStatusBySid: Resolver<
//     null,
//     callStatusInputArgs,
//     ConsultServiceContext,
//     callStatusResult
//     > = async (parent, { callStatusInput }, { consultsDb }) => {
//     const exotelRepo = consultsDb.getCustomRepository(ExotelDetailsRepository);

//     const inProgressCalls = await exotelRepo.getAllCallDetailsByStatus(callStatusInput.status);

//     const exotel_url = `https://${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}@${process.env.EXOTEL_SUB_DOMAIN}${process.env.EXOTEL_URI}`;

//     const updatedCallSidArray: string[] = [];
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const errorArray: any[] = [];

//     for (const each of inProgressCalls) {
//         await fetch(exotel_url + '/' + each.callSid + '.json', {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' },
//         })
//         .then((res) => res.json())
//         .then(async (res) => {
//             let updateObj = {
//             status: res['Call']['Status'],
//             callEndTime: res['Call']['EndTime'],
//             totalCallDuration: res['Call']['Duration'],
//             price: res['Call']['Price'],
//             patientPickedUp: res['Call']['Status'] === 'completed' ? true : false,
//             doctorPickedUp: res['Call']['Status'] === 'completed' ? true : false,
//             };

//             if (res['Call']['RecordingUrl']) {
//             await fetch(res['Call']['RecordingUrl'], {
//                 method: 'GET',
//             })
//                 .then((response) => response.arrayBuffer())
//                 .then(async (resp) => {
//                 const uploadDocumentInput = {
//                     fileType: 'MPEG',
//                     base64FileInput: Buffer.from(resp).toString('base64'),
//                 };

//                 //upload file to blob storage
//                 const blobUrl = await uploadFileToBlobStorage(
//                     uploadDocumentInput.fileType,
//                     uploadDocumentInput.base64FileInput
//                 );

//                 updateObj = Object.assign(updateObj, { recordingUrl: blobUrl });

//                 await exotelRepo.updateCallDetails(each.id, updateObj);
//                 });
//             } else {
//             await exotelRepo.updateCallDetails(each.id, updateObj);
//             }

//             updatedCallSidArray.push(each.callSid);
//         })
//         .catch((error) => {
//             console.error('exotelError in update: ', error);
//             errorArray.push(error);
//         });
//     }

//     return { updatedCallSidArray, errorArray: JSON.stringify(errorArray) };
// };



// export const exotelCallingResolvers = {
//     Mutation: {
//         updateCallStatusBySid,
//     },
// };