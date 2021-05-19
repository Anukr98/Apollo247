/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getPrescriptionsByMobileNumber
// ====================================================

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescriptions_response_prescriptionFiles {
  __typename: "PrecriptionFileParameters";
  id: string | null;
  fileName: string | null;
  mimeType: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescriptions_response {
  __typename: "PrescriptionsBaseResponse";
  id: string;
  prescriptionName: string;
  date: any;
  prescribedBy: string | null;
  notes: string | null;
  prescriptionSource: string | null;
  siteDisplayName: string | null;
  source: string;
  fileUrl: string;
  prescriptionFiles: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescriptions_response_prescriptionFiles | null)[] | null;
  hospital_name: string | null;
  hospitalId: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescriptions {
  __typename: "PrescriptionDownloadResponse";
  response: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescriptions_response | null)[] | null;
  errorCode: number | null;
  errorMsg: string | null;
  errorType: string | null;
}

export interface getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber {
  __typename: "ProfilePrescriptionsResult";
  patientId: string | null;
  prescriptions: getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber_prescriptions | null;
}

export interface getPrescriptionsByMobileNumber {
  getPrescriptionsByMobileNumber: (getPrescriptionsByMobileNumber_getPrescriptionsByMobileNumber | null)[] | null;
}

export interface getPrescriptionsByMobileNumberVariables {
  MobileNumber: string;
  recordId?: string | null;
  source?: string | null;
}
