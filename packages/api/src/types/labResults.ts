export interface PatientLabResults {
  checkedBy: string;
  consultId: string;
  dateImported: string;
  departmentName: string;
  id: string;
  identifier: string;
  labTestDate: number;
  labTestFollowUpDate: number;
  labTestName: string;
  labTestObjectId: string;
  labTestRefferedBy: string;
  labTestResults: LabTestResults[];
  labTestSource: string;
  orderId: string;
  packageId: string;
  packageName: string;
  signingDocName: string;
  signingDocNameLine1: string;
  signingDocNameLine2: string;
  siteDisplayName: string;
  tag: string;
  testId: number;
  testResultFiles: TestResultFiles[];
  testSequence: number;
  uhid: string;
}

export interface LabTestResults {
  parameterName: string;
  result: string;
  unit: string;
  range: string;
  outOfRange: boolean;
  resultDate: number;
  __isset_bit_vector: [number, number];
}

export interface TestResultFiles {
  id: string;
  fileName: string;
  mimeType: string;
  setContent: boolean;
  setDateCreated: boolean;
  setFileName: boolean;
  setId: boolean;
  setMimeType: boolean;
}
