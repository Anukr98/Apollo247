/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { PatientConsultEventToDoctorInput } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: postConsultEventToDoctor
// ====================================================

export interface postConsultEventToDoctor_postConsultEventToDoctor_response {
  __typename: "WebEngageResponseData";
  status: string;
}

export interface postConsultEventToDoctor_postConsultEventToDoctor {
  __typename: "WebEngageResponse";
  response: postConsultEventToDoctor_postConsultEventToDoctor_response;
}

export interface postConsultEventToDoctor {
  postConsultEventToDoctor: postConsultEventToDoctor_postConsultEventToDoctor | null;
}

export interface postConsultEventToDoctorVariables {
  doctorConsultEventInput: PatientConsultEventToDoctorInput;
}
