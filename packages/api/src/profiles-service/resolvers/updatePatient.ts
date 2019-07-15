import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Patient } from 'profiles-service/entity/patient';
import { BaseEntity } from 'typeorm';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/AphErrorMessages';

export const updatePatientTypeDefs = gql`
  input UpdatePatientInput {
    id: ID!
    firstName: String
    lastName: String
    mobileNumber: String
    gender: Gender
    uhid: String
    emailAddress: String
    dateOfBirth: String
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
  return entity;
}

type UpdatePatientInput = { patientInput: Partial<Patient> & { id: Patient['id'] } };
const updatePatient: Resolver<any, UpdatePatientInput> = async (
  parent,
  { patientInput }
): Promise<UpdatePatientResult> => {
  const { id, ...updateAttrs } = patientInput;
  const patient = await updateEntity<Patient>(Patient, id, updateAttrs);
  return { patient };
};

export const updatePatientResolvers = {
  Mutation: {
    updatePatient,
  },
};
