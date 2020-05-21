import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';
import { PatientRepository } from 'profiles-service/repositories/patientRepository';
import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';
import {
  prismAuthentication,
  prismGetUsers,
  prismGetUserDetails,
  linkUhid,
  delinkUhid,
} from 'helpers/prismCall';

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

  //Removing the country code from mobile number
  const mobileNumberWithOutCode = sanitizeMobileNumber(mobileNumber);

  //Calling the prism apis
  await callPrismApis(mobileNumberWithOutCode, primaryUhid, linkedUhids, true);

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

  //Removing the country code from mobile number
  const mobileNumberWithOutCode = sanitizeMobileNumber(mobileNumber);

  //Calling the prism apis
  await callPrismApis(mobileNumberWithOutCode, primaryUhid, unlinkUhids, false);

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

const sanitizeMobileNumber = (mobileNumber: string) => {
  const codes: string[] = process.env.COUNTRY_CODES.split(',');
  let mobileNumberWithOutCode = mobileNumber;

  codes.forEach((code) => {
    if (mobileNumber.includes(code)) {
      mobileNumberWithOutCode = mobileNumber.replace(code, '');
    }
  });

  return mobileNumberWithOutCode;
};

const callPrismApis = async (
  mobileNumber: string,
  primaryUhid: string,
  linkedUhids: string[],
  link: boolean
) => {
  const authoken = await prismAuthentication(mobileNumber);
  if (!authoken.response)
    throw new AphError(AphErrorMessages.PRISM_AUTH_TOKEN_ERROR, undefined, {});

  const authToken = authoken.response;

  const getUsersPrism = await prismGetUsers(mobileNumber, authToken);
  if (!getUsersPrism.response)
    throw new AphError(AphErrorMessages.PRISM_GET_USERS_ERROR, undefined, {});

  const getUserDetailsPrism = await prismGetUserDetails(primaryUhid, authToken);
  if (!getUserDetailsPrism.response)
    throw new AphError(AphErrorMessages.PRISM_GET_USER_DETAILS_ERROR, undefined, {});

  if (link) {
    const prismLinkUhid = await linkUhid(primaryUhid, authToken, linkedUhids.join(','));
    if (!prismLinkUhid.response)
      throw new AphError(AphErrorMessages.PRISM_LINK_UHID_ERROR, undefined, {});
  } else {
    const prismDeLinkUhid = await delinkUhid(primaryUhid, authToken, linkedUhids.join(','));
    if (!prismDeLinkUhid.response)
      throw new AphError(AphErrorMessages.PRISM_DELINK_UHID_ERROR, undefined, {});
  }
};

export const uhidResolvers = {
  Mutation: {
    linkUhids,
    unlinkUhids,
  },
};
