export interface AppointmentPayload {
  appointmentDate: string;
  appointmentTypeId: number;
  askApolloReferenceIdForRelation: string;
  askApolloReferenceIdForSelf: string;
  cityId: number;
  cityName: string;
  dateOfBirth: string;
  doctorId: number;
  doctorName: string;
  gender: string;
  hospitalId: string;
  hospitalName: string;
  leadSource: string;
  patientEmailId: string;
  patientFirstName: string;
  patientLastName: string;
  patientMobileNo: string;
  patientUHID: string;
  relationTypeId: number;
  salutation: number;
  slotId: string;
  slotTime: string;
  speciality: string;
  specialityId: string;
  userFirstName: string;
  userLastName: string;
  apptIdPg: string;
}

export interface AppointmentResp {
  errorCode: number;
  errorMsg: string;
  appointmentId: number;
  leadId: number;
  userId: number;
  patientId: number;
  userPatientId: number;
  specialityId: number;
  specialityName: string;
  serviceTypeId: number;
  serviceTypeName: string;
  isNewuser: number;
  patientUHID: string;
  patientPRNNumber: string;
  mmAppointment: number;
  uAID: string;
  refIdForPayment: string;
  isPaymentEnabled: boolean;
  paymentAmount: string;
  doctorGender: number;
  key: string;
}

export interface SampleMessage {
  message: string;
}
export interface SymptomsList {
  symptom: string;
  since: null;
  howOften: null;
  severity: null;
}
