import gql from 'graphql-tag';
import { Resolver } from 'api-gateway';
import { ProfilesServiceContext } from 'profiles-service/profilesServiceContext';

import { MedicalRecordType } from 'profiles-service/entities';

import {
    deletePrescriptionFromPrism,
    deleteLabTestFromPrism,
    deleteHealthCheckFromPrism,
    deleteDischargeSummaryFromPrism
} from 'helpers/phrV1Services';

import { PatientRepository } from 'profiles-service/repositories/patientRepository';

import { AphError } from 'AphError';
import { AphErrorMessages } from '@aph/universal/dist/AphErrorMessages';

export const deletePatientPrismMedicalRecordTypeDefs = gql`
input DeletePatientPrismMedicalRecordInput {
    id: String
    patientId: ID!
    recordType: MedicalRecordType!
  }

  type DeletePatientPrismMedicalRecordResult {
    status: Boolean
  }

  extend type Mutation {
    deletePatientPrismMedicalRecord(deletePatientPrismMedicalRecordInput: DeletePatientPrismMedicalRecordInput): DeletePatientPrismMedicalRecordResult!
  }
`;

type DeletePatientPrismMedicalRecordInput = {
    id: string;
    patientId: string;
    recordType: MedicalRecordType;
}

type DeletePatientPrismMedicalRecordInputArgs = { deletePatientPrismMedicalRecordInput: DeletePatientPrismMedicalRecordInput };

type DeletePatientPrismMedicalRecordResult = {
    status: boolean;
};

const deletePatientPrismMedicalRecord: Resolver<
    null,
    DeletePatientPrismMedicalRecordInputArgs,
    ProfilesServiceContext,
    DeletePatientPrismMedicalRecordResult
> = async (parent, { deletePatientPrismMedicalRecordInput }, { profilesDb }) => {

    const patientsRepo = profilesDb.getCustomRepository(PatientRepository);
    const patient: any = await patientsRepo.getPatientDetails(deletePatientPrismMedicalRecordInput.patientId);

    if (patient == null) {
        throw new AphError(AphErrorMessages.INVALID_PATIENT_ID, undefined, {});
    }

    switch (deletePatientPrismMedicalRecordInput.recordType) {

        case "PRESCRIPTION":
            await deletePrescriptionFromPrism(patient.uhid, deletePatientPrismMedicalRecordInput.id)
            break;

        case "TEST_REPORT":
            await deleteLabTestFromPrism(patient.uhid, deletePatientPrismMedicalRecordInput.id)
            break;

        case "HEALTHCHECK":
            await deleteHealthCheckFromPrism(patient.uhid, deletePatientPrismMedicalRecordInput.id)
            break;

        case "HOSPITALIZATION":
            await deleteDischargeSummaryFromPrism(patient.uhid, deletePatientPrismMedicalRecordInput.id)
            break;
    }

    return { status: true }
};

export const deletePatientPrismMedicalRecordResolvers = {
    Mutation: {
        deletePatientPrismMedicalRecord,
    },
};