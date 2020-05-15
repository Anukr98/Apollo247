import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { Patient, Gender, Relation } from 'profiles-service/entities';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const uhidTypeDefs = gql`
  extend type Mutation {
    linkUhids(primaryUhid: String, linkedUhids: [String]): Boolean!
    unlinkUhids(primaryUhid: String, unlinkUhids: [String]): Boolean!
  }
`;

const linkUhids: Resolver<
  null,
  { primaryUhid: string; linkedUhids: string[] },
  ProfilesServiceContext,
  Boolean
> = async (parent, { primaryUhid, linkedUhids }, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientsRepo.findByMobileNumber('+919533077359');
  if (patients == null || patients.length == 0) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, {});
  }
  console.log('patients==', patients);

  const primaryUhidExists = patients.some((patient) => patient.isUhidPrimary);
  if (primaryUhidExists) throw new AphError(AphErrorMessages.PRIMARY_UHID_EXISTS, undefined, {});

  verifyUhids(patients, primaryUhid, linkedUhids);

  let primaryPatientId = '';
  const linkedPatientIds: string[] = [];

  patients.forEach((patient) => {
    if (patient.uhid == primaryUhid) {
      primaryPatientId = patient.id;
    } else if (linkedUhids.includes(patient.uhid)) {
      linkedPatientIds.push(patient.id);
    }
  });

  if (primaryPatientId && linkedPatientIds.length) {
    patientsRepo.updateLinkedUhidAccount([primaryPatientId], 'isUhidPrimary', true);
    patientsRepo.updateLinkedUhidAccount(linkedPatientIds, 'isLinked', true, primaryUhid);
  }

  return true;
};

const verifyUhids = (patients: Patient[], primaryUhid: string, linkedUhids: string[]) => {
  const patientUhids = patients.map((patient) => patient.uhid);
  console.log('patientUhids==', patientUhids);

  const isPrimaryUhidPresent = patientUhids.includes(primaryUhid);
  if (!isPrimaryUhidPresent)
    throw new AphError(AphErrorMessages.INVALID_PRIMARY_UHID, undefined, {});

  const AreLinkedUhidsPresent = linkedUhids.every((id) => patientUhids.includes(id));
  if (!AreLinkedUhidsPresent)
    throw new AphError(AphErrorMessages.INVALID_LINKED_UHID, undefined, {});
};

const unlinkUhids: Resolver<
  null,
  { primaryUhid: string; unlinkUhids: string[] },
  ProfilesServiceContext,
  Boolean
> = async (parent, { primaryUhid, unlinkUhids }, { mobileNumber, profilesDb }) => {
  const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
  const patients = await patientsRepo.findByMobileNumber(mobileNumber);
  if (patients == null || patients.length == 0) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, {});
  }
  verifyUhids(patients, primaryUhid, unlinkUhids);

  let primaryPatientId = '';
  const linkedPatientIds: string[] = [];

  patients.forEach((patient) => {
    if (patient.uhid == primaryUhid) {
      primaryPatientId = patient.id;
    } else if (unlinkUhids.includes(patient.uhid)) {
      linkedPatientIds.push(patient.id);
    }
  });

  if (primaryPatientId && linkedPatientIds.length) {
    // patientsRepo.updateLinkedUhidAccount([primaryPatientId], 'isUhidPrimary', true);
    patientsRepo.updateLinkedUhidAccount(linkedPatientIds, 'isLinked', false, 'null');
  }

  return true;
};

export const uhidResolvers = {
  Mutation: {
    linkUhids,
    unlinkUhids,
  },
};
