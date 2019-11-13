import gql from 'graphql-tag';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient } from 'profiles-service/entities';
import { PatientNewRepository } from 'profiles-service/repositories/patientNewRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { Resolver } from 'api-gateway';
import { getConnection } from 'typeorm';

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

  //get access token from microsoft auth api
  const authToken = await patientsNewRepo.getAuthToken();
  console.log('AcessToken', authToken);

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
