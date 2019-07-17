import gql from 'graphql-tag';
import { Patient } from 'profiles-service/entity/patient';
import { BaseEntity } from 'typeorm';
import { AphError, AphUserInputError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';
import { validate } from 'class-validator';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profiles-service';

export const updatePatientTypeDefs = gql`
  input UpdatePatientInput {
    id: ID!
    firstName: String
    lastName: String
    mobileNumber: String
    gender: Gender
    uhid: String
    emailAddress: String
    dateOfBirth: Date
    relation: Relation
  }

  type UpdatePatientResult {
    patient: Patient
  }

  extend type Mutation {
    updatePatient(patientInput: UpdatePatientInput): UpdatePatientResult!
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
const updatePatient: Resolver<
  null,
  UpdatePatientArgs,
  ProfilesServiceContext,
  UpdatePatientResult
> = async (parent, { patientInput }) => {
  const { id, ...updateAttrs } = patientInput;
  const patient = await updateEntity<Patient>(Patient, id, updateAttrs);
  return { patient };
};

export const updatePatientResolvers = {
  Mutation: {
    updatePatient,
  },
};
