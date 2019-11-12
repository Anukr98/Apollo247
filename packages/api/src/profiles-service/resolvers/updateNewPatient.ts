import gql from 'graphql-tag';
import { Patient } from 'profiles-service/entities';
import { BaseEntity } from 'typeorm';
import { AphError, AphUserInputError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import { validate } from 'class-validator';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientNewRepository } from 'profiles-service/repositories/patientNewRepository';

export const updateNewPatientTypeDefs = gql`
  extend type Mutation {
    updateNewPatient(patientInput: UpdatePatientInput): UpdatePatientResult!
  }
`;

type UpdatePatientResult = {
  patient: Patient | null;
};

async function updateEntity<E extends BaseEntity>(
  Entity: typeof BaseEntity,
  id: string,
  attrs: Partial<Omit<E, keyof BaseEntity>>
): Promise<E> {
  let entity: E;
  try {
    entity = await Entity.findOneOrFail<E>(id);
    await Entity.update(id, attrs);
    await entity.reload();
  } catch (updateProfileError) {
    throw new AphError(AphErrorMessages.UPDATE_PROFILE_ERROR, undefined, { updateProfileError });
  }
  const errors = await validate(entity);
  if (errors.length > 0) {
    throw new AphUserInputError(AphErrorMessages.INVALID_ENTITY, { errors });
  }
  return entity;
}

type UpdatePatientArgs = { patientInput: Partial<Patient> & { id: Patient['id'] } };
const updateNewPatient: Resolver<
  null,
  UpdatePatientArgs,
  ProfilesServiceContext,
  UpdatePatientResult
> = async (parent, { patientInput }, { mobileNumber, profilesDb }) => {
  const { id, ...updateAttrs } = patientInput;
  const patient = await updateEntity<Patient>(Patient, id, updateAttrs);

  const patientsNewRepo = profilesDb.getCustomRepository(PatientNewRepository);
  //get access token from microsoft auth api
  const authToken = await patientsNewRepo.getAuthToken();
  const patientUpdate = await patientsNewRepo.updatePatient(authToken, patientInput, mobileNumber);
  console.log('patient update result', patientUpdate);

  return { patient };
};

export const updateNewPatientResolvers = {
  Mutation: {
    updateNewPatient,
  },
};
