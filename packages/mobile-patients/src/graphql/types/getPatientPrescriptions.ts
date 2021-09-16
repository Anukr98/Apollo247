/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.


// ====================================================
// GraphQL query operation: getPatientPrescriptions
// ====================================================

export interface getPatientPrescriptions_getPatientPrescriptions_getPatientPrescriptions_diagnosticPrescription {
    __typename: "PrescriptionRes";
    itemname: string;
}

export interface getPatientPrescriptions_getPatientPrescriptions_getPatientPrescriptions_caseSheet {
    __typename: "PrescriptionRes";
    notes: string;
    blobName: string;
    consultType: string;
    prescriptionGeneratedDate: string;
    diagnosticPrescription: getPatientPrescriptions_getPatientPrescriptions_getPatientPrescriptions_diagnosticPrescription;
  }
export interface getPatientPrescriptions_getPatientPrescriptions_response {
  __typename: "PrescriptionRes";
  doctorName: string;
  caseSheet: getPatientPrescriptions_getPatientPrescriptions_getPatientPrescriptions_caseSheet;
}

export interface getPatientPrescriptions_getPatientPrescriptions {
  __typename: "PrescriptionRes";
  response: getPatientPrescriptions_getPatientPrescriptions_response[] | null;
}

export interface getPatientPrescriptions {
    getPatientPrescriptions: getPatientPrescriptions_getPatientPrescriptions;
}

export interface getPatientPrescriptionsVariables {
  patientId?: string | null;
  limit?: number;
}
