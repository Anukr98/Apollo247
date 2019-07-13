import gql from 'graphql-tag';
import { Resolver } from 'profiles-service/profiles-service';
import { Patient, ErrorMsgs } from 'profiles-service/entity/patient';
import { BaseEntity, QueryFailedError } from 'typeorm';

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
    errors: Error
  }

  extend type Mutation {
    updatePatient(patientInput: UpdatePatientInput): UpdatePatientResult!
  }
`;

type UpdatePatientResult = {
  patient: Patient | null;
  errors: { messages: string[] } | null;
};

function wait<R, E>(promise: Promise<R>): [R, E] {
  return (promise.then((data: R) => [data, null], (err: E) => [null, err]) as any) as [R, E];
}

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
  } catch (e) {
    throw e;
  }
  return entity;
}

type UpdatePatientInput = { patientInput: Partial<Patient> & { id: Patient['id'] } };
const updatePatient: Resolver<any, UpdatePatientInput> = async (
  parent,
  { patientInput }
): Promise<UpdatePatientResult> => {
  const { id, ...updateAttrs } = patientInput;
  const [updatedPatient, updateError] = await wait<Patient, QueryFailedError>(
    updateEntity<Patient>(Patient, id, updateAttrs)
  );

  if (updateError) return { patient: null, errors: { messages: [ErrorMsgs.UPDATE_PROFILE_ERROR] } };
  return { patient: updatedPatient, errors: null };
};

export const updatePatientResolvers = {
  Mutation: {
    updatePatient
  },
};
