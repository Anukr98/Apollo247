export interface GetUsersResponse {
  errorCode: null;
  errorMsg: null;
  errorType: null;
  response: {}[];
}

export interface LabResultsUploadRequest {
  labTestName: string;
  labTestSource: string;
  labTestDate: number;
  labTestRefferedBy: string;
  observation: string;
  identifier: string;
  visitId: string;
  additionalNotes: string;
  labTestResults: {
    parameterName: string;
    result: string;
    unit: string;
    range: string;
    outOfRange: Boolean;
    resultDate: number;
  }[];
  testResultFiles: {
    id: string;
    fileName: string;
    mimeType: string;
    dateCreated: number;
    content: string;
  }[];
}

export interface LabResultsUploadResponse {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: string;
}

export interface PrescriptionUploadRequest {
  prescriptionName: string;
  prescribedBy: string;
  dateOfPrescription: number;
  endDate: number;
  startDate: number;
  notes: string;
  prescriptionSource: string;
  prescriptionDetail: [];
  prescriptionFiles: {
    id: string;
    fileName: string;
    mimeType: string;
    dateCreated: number;
    content: string;
  }[];
}

export interface PrescriptionUploadResponse {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: string;
}