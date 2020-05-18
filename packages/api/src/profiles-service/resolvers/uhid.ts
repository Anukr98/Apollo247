import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
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
  const patients = await patientsRepo.findByMobileNumber(mobileNumber);
  if (patients == null || patients.length == 0) {
    throw new AphError(AphErrorMessages.INSUFFICIENT_PRIVILEGES, undefined, {});
  }

  //Getting all the uhids related to patient
  const patientUhids = patients.map((patient) => patient.uhid);

  //Checking if given primaryUhid is related to patient
  const isPrimaryUhidPresent = patientUhids.includes(primaryUhid);
  if (!isPrimaryUhidPresent)
    throw new AphError(AphErrorMessages.INVALID_PRIMARY_UHID, undefined, {});

  //Checking if given linkedUhids are related to patient
  const AreLinkedUhidsPresent = linkedUhids.every((id) => patientUhids.includes(id));
  if (!AreLinkedUhidsPresent)
    throw new AphError(AphErrorMessages.INVALID_LINKED_UHID, undefined, {});

  //checking if primary uhid is already exists and not equal to the give one
  const primaryUhidExists = patients.some(
    (patient) => patient.isUhidPrimary && patient.uhid != primaryUhid
  );
  if (primaryUhidExists) throw new AphError(AphErrorMessages.PRIMARY_UHID_EXISTS, undefined, {});

  //Getting the ids of primary and linked patients
  let primaryPatientId = '';
  const linkedPatientIds: string[] = [];
  patients.forEach((patient) => {
    if (patient.uhid == primaryUhid) {
      primaryPatientId = patient.id;
    } else if (linkedUhids.includes(patient.uhid)) {
      linkedPatientIds.push(patient.id);
    }
  });

  //Updating the primary and linked patients
  if (primaryPatientId && linkedPatientIds.length) {
    patientsRepo.updateLinkedUhidAccount([primaryPatientId], 'isUhidPrimary', true);
    patientsRepo.updateLinkedUhidAccount(
      linkedPatientIds,
      'isLinked',
      true,
      primaryUhid,
      primaryPatientId
    );
  }

  return true;
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

  //Checking if given primaryUhid is related to patient and is marked as primary
  const isPrimaryUhidPresent = patients.filter(
    (patient) => patient.uhid == primaryUhid && patient.isUhidPrimary
  );
  if (!isPrimaryUhidPresent.length)
    throw new AphError(AphErrorMessages.INVALID_PRIMARY_UHID, undefined, {});

  //Checking if all the given unlinkUhids are related to patient and are marked as linked
  const AreLinkedUhidsPresent = patients.filter(
    (patient) => unlinkUhids.includes(patient.uhid) && patient.isLinked
  );
  if (AreLinkedUhidsPresent.length != unlinkUhids.length)
    throw new AphError(AphErrorMessages.INVALID_LINKED_UHID, undefined, {});

  //Getting the ids of primary and linked patients
  let primaryPatientId = '';
  const linkedPatientIds: string[] = [];
  const notUnLinkedPatientIds: string[] = [];
  patients.forEach((patient) => {
    if (patient.uhid == primaryUhid) {
      primaryPatientId = patient.id;
    } else if (unlinkUhids.includes(patient.uhid)) {
      linkedPatientIds.push(patient.id);
    } else if (patient.isLinked && patient.primaryUhid == primaryUhid) {
      notUnLinkedPatientIds.push(patient.id);
    }
  });

  //Updating the primary and linked patients
  if (primaryPatientId && linkedPatientIds.length) {
    patientsRepo.updateLinkedUhidAccount(linkedPatientIds, 'isLinked', false, 'null');

    //If no uhid is linked to primary uhid, marking its isUhidPrimary column as false
    if (notUnLinkedPatientIds.length == 0) {
      patientsRepo.updateLinkedUhidAccount([primaryPatientId], 'isUhidPrimary', false);
    }
  }

  return true;
};

export const uhidResolvers = {
  Mutation: {
    linkUhids,
    unlinkUhids,
  },
};
