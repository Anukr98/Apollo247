import { CaseSheetMedicinePrescription } from 'consults-service/entities';

export interface GetUsersResponse {
  errorCode: null;
  errorMsg: null;
  errorType: null;
  response: {
    userName: string;
    hospital: string;
    activeStatus: string;
    siteKey: string;
    gender: string;
    dob: string;
    uhid: string;
  }[];
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

export interface LabResultsDownloadResponse {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: {
    authToken: string;
    userId: string;
    id: string;
    fileUrl: string; //this is not given by PHR. Added for internal purpose
    date: Date; //this is not given by PHR. Added for internal purpose
    labTestName: string;
    labTestSource: string;
    packageId: string;
    packageName: string;
    labTestDate: number;
    labTestRefferedBy: string;
    observation: string;
    additionalNotes: string;
    consultId: string;
    tag: string;
    uhid: string;
    testId: number;
    labTestObjectId: string;
    departmentName: string;
    testSequence: number;
    dateImported: number;
    labTestFollowUpDate: number;
    orderId: string;
    identifier: string;
    visitId: string;
    signingDocName: string;
    checkedBy: string;
    laboratoryHod: string;
    siteDisplayName: string;
    signingDocNameLine1: string;
    signingDocNameLine2: string;
    testResultFiles: {
      id: string;
      fileName: string;
      mimeType: string;
      content: string;
      byteContent: string;
      dateCreated: number;
    }[];
    labTestResults: {
      parameterName: string;
      result: string;
      unit: string;
      range: string;
      outOfRange: false;
      resultDate: number;
    }[];
  }[];
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
  speciality: string;
  hospital_name: string;
  address: string;
  city: string;
  pincode: string;
  instructions: string[];
  diagnosis: string[];
  diagnosticPrescription: string[];
  medicinePrescriptions: CaseSheetMedicinePrescription[];
}

export interface PrescriptionUploadResponse {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: string;
}

export interface PrescriptionDownloadResponse {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: {
    authToken: string;
    userId: string;
    fileUrl: string; //this is not given by PHR. Added for internal purpose
    date: Date; //this is not given by PHR. Added for internal purpose
    id: string;
    prescriptionName: string;
    dateOfPrescription: number;
    startDate: number;
    endDate: number;
    prescribedBy: string;
    notes: string;
    prescriptionSource: string;
    source: string;
    prescriptionDetail: [];
    prescriptionFiles: {
      id: string;
      fileName: string;
      mimeType: string;
      content: string;
      byteContent: string;
      dateCreated: number;
    }[];
  }[];
}

export interface CreateNewUsersResponse {
  errorCode: number;
  errorMsg: string;
  errorType: string;
  response: string; //"A new User has been successfully added"
}

export interface GetAuthTokenResponse {
  errorCode: null;
  errorMsg: null;
  errorType: null;
  response: string;
}
