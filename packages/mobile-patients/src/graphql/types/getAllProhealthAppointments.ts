/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { BookingStatus, BookingSource, GENDER } from "./globalTypes";

// ====================================================
// GraphQL query operation: getAllProhealthAppointments
// ====================================================

export interface getAllProhealthAppointments_getAllProhealthAppointments_appointments_patientObj {
  __typename: "ProhealthPatient";
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  gender: GENDER | null;
  mobileNumber: string | null;
  dateOfBirth: any | null;
}

export interface getAllProhealthAppointments_getAllProhealthAppointments_appointments_prohealthPackage {
  __typename: "PackageDetails";
  packageName: string | null;
  id: string | null;
}

export interface getAllProhealthAppointments_getAllProhealthAppointments_appointments_prohealthHospital {
  __typename: "HospitalDetails";
  unitType: string | null;
  unitName: string | null;
}

export interface getAllProhealthAppointments_getAllProhealthAppointments_appointments {
  __typename: "ProhealthAppointment";
  appointmentStartDateTimeUTC: any | null;
  appointmentEndDateTimeUTC: any | null;
  status: BookingStatus | null;
  displayId: number | null;
  packageCategoryId: string | null;
  price: number | null;
  bookingSource: BookingSource | null;
  patientObj: getAllProhealthAppointments_getAllProhealthAppointments_appointments_patientObj | null;
  prohealthPackage: getAllProhealthAppointments_getAllProhealthAppointments_appointments_prohealthPackage | null;
  prohealthHospital: getAllProhealthAppointments_getAllProhealthAppointments_appointments_prohealthHospital | null;
}

export interface getAllProhealthAppointments_getAllProhealthAppointments {
  __typename: "Appointments";
  appointments: (getAllProhealthAppointments_getAllProhealthAppointments_appointments | null)[] | null;
}

export interface getAllProhealthAppointments {
  getAllProhealthAppointments: getAllProhealthAppointments_getAllProhealthAppointments | null;
}

export interface getAllProhealthAppointmentsVariables {
  patientId: string;
}
