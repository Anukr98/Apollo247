import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient } from 'profiles-service/entities';
import { PatientNewRepository } from 'profiles-service/repositories/patientNewRepository';
import { logsUtility } from 'logsUtility';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';
import { format, differenceInMilliseconds } from 'date-fns';

export const getCurrentLoginPatientsTypeDefs = gql`
  extend type Query {
    getCurrentLoginPatients: GetCurrentPatientsResult
  }
`;

type GetCurrentPatientsResult = {
  patients: Object[] | null;
};

const getCurrentLoginPatients: Resolver<
  null,
  {},
  ProfilesServiceContext,
  GetCurrentPatientsResult
> = async (parent, args, { firebaseUid, mobileNumber, profilesDb }) => {
  const patientsNewRepo = profilesDb.getCustomRepository(PatientNewRepository);

  const reqStartTime = new Date();
  const reqStartTimeFormatted = format(reqStartTime, "yyyy-MM-dd'T'HH:mm:ss.SSSX");

  const data = logsUtility.logger(
    'profilServices',
    JSON.stringify({
      message: 'External apiRequest Starting',
      time: reqStartTimeFormatted,
      operation: `https://healthcare.crm8.dynamics.com/api/data/v9.1/contacts`,
      level: 'info',
    })
  );
  console.log('data', data);
  //get access token from microsoft auth api
  const authToken = await patientsNewRepo.getAuthToken();
  console.log('AcessToken', authToken);
  const insertResponse = await patientsNewRepo.insertPatient(authToken, mobileNumber);

  let patientPromises: Object[] = [];

  const findOrCreatePatient = async (
    findOptions: { mobileNumber: Patient['mobileNumber'] },
    createOptions: Partial<Patient>
  ): Promise<Patient> => {
    const existingPatient = await Patient.findOne({
      where: { mobileNumber: findOptions.mobileNumber },
    });

    if (existingPatient) {
      return existingPatient;
    } else {
      const response = Patient.create(createOptions).save();

      //insert patient into backend
      const insertResponse = await patientsNewRepo.insertPatient(authToken, mobileNumber);
      console.log('insert response: ====', insertResponse);

      return response;
    }
  };

  patientPromises = [
    findOrCreatePatient(
      { mobileNumber },
      {
        firebaseUid,
        firstName: '',
        lastName: '',
        gender: undefined,
        mobileNumber,
        uhid: '',
      }
    ),
  ];
  const patients = await Promise.all(patientPromises).catch((findOrCreateErrors) => {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { findOrCreateErrors });
  });
  return { patients };
};

export const getCurrentLoginPatientsResolvers = {
  Patient: {
    async __resolveReference(object: Patient) {
      const connection = getConnection();
      const patientsRepo = connection.getRepository(Patient);
      const patientDetails = await patientsRepo.findOne({ where: { id: object.id } });
      return patientDetails;
    },
  },
  Query: {
    getCurrentLoginPatients,
  },
};
