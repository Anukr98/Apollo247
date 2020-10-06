import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { MedicalRecordsRepository } from 'profiles-service/repositories/medicalRecordsRepository';
import { MedicalRecordParametersRepository } from 'profiles-service/repositories/medicalRecordParametersRepository';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const deletePatientMedicalRecordTypeDefs = gql`
  type DeleteMedicalRecordResult {
    status: Boolean
  }

  extend type Mutation {
    deletePatientMedicalRecord(recordId: ID!): DeleteMedicalRecordResult!
  }
`;

type DeleteMedicalRecordResult = {
  status: boolean;
};

const deletePatientMedicalRecord: Resolver<
  null,
  { recordId: string },
  ProfilesServiceContext,
  DeleteMedicalRecordResult
> = async (parent, args, { profilesDb, mobileNumber }) => {
  //validate patient by mobilenumber
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientsRepo.findByMobileNumber(mobileNumber);
  if (patients == null || patients.length == 0) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, {});
  }

  const relatedPatientIds = patients.map((patient) => {
    return patient.id;
  });

  //validate medical record id
  const medicalRecordRepo = profilesDb.getCustomRepository(MedicalRecordsRepository);
  const medicalRecord = await medicalRecordRepo.findById(args.recordId);
  if (!medicalRecord) {
    throw new AphError(AphErrorMessages.INVALID_MEDICAL_RECORD_ID, undefined, {});
  }

  //check the previlages of the user to delete the medical record
  const validMedicalRecord = await medicalRecordRepo.findByIdAndPatientIds(
    relatedPatientIds,
    args.recordId
  );
  if (!validMedicalRecord) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, {});
  }

  //deleting medical record parameters
  const medicalRecordParameters = validMedicalRecord.medicalRecordParameters;
  if (medicalRecordParameters.length > 0) {
    const recordParametersIds = medicalRecordParameters.map((recordParameter) => {
      return recordParameter.id;
    });
    const recordParamsRepo = profilesDb.getCustomRepository(MedicalRecordParametersRepository);
    await recordParamsRepo.deleteByIds(recordParametersIds);
  }

  await medicalRecordRepo.deleteMedicalRecord(args.recordId);
  return { status: true };
};

export const deletePatientMedicalRecordResolvers = {
  Mutation: {
    deletePatientMedicalRecord,
  },
};
