export interface PrismLabTestResult {
  additionalNotes: string;
  checkedBy: string;
  consultId: string;
  dateImported: string;
  departmentName: string;
  id: string;
  identifier: string;
  laboratoryHod: string;
  labTestDate: number;
  labTestFollowUpDate: number;
  labTestName: string;
  labTestObjectId: string;
  labTestRefferedBy: string;
  labTestResults: PrismLabTestResultParameter[];
  labTestSource: string;
  observation: string;
  orderId: string;
  packageId: string;
  packageName: string;
  signingDocName: string;
  signingDocNameLine1: string;
  signingDocNameLine2: string;
  siteDisplayName: string;
  tag: string;
  testId: number;
  testResultFiles: PrismTestResultFile[];
  testSequence: number;
  uhid: string;
  visitId: string;
  userId: string;
}
export interface PrismLabTestResultParameter {
  parameterName: string;
  result: string;
  unit: string;
  range: string;
  outOfRange: boolean;
  resultDate: number;
  setOutOfRange: boolean;
  setResultDate: boolean;
  setUnit: boolean;
  setParameterName: boolean;
  setRange: boolean;
  setResult: boolean;
}
export interface PrismTestResultFile {
  id: string;
  fileName: string;
  mimeType: string;
}
export interface PrismHealthCheckResult {
  appointmentDate: number;
  followupDate: number;
  healthCheckDate: number;
  healthCheckFiles: PrismHealthCheckFile[];
  healthCheckName: string;
  healthCheckSummary: string;
  id: string;
  source: string;
}
export interface PrismHealthCheckFile {
  dateCreated: number;
  fileName: string;
  id: string;
  mimeType: string;
}
export interface PrismHospitalizationResult {
  dateOfDischarge: number;
  dateOfHospitalization: number;
  dateOfNextVisit: number;
  diagnosisNotes: string;
  hospitalizationFiles: PrismHospitalizationFile[];
  id: string;
  source: string;
}
export interface PrismHospitalizationFile {
  dateCreated: number;
  fileName: string;
  id: string;
  mimeType: string;
}
