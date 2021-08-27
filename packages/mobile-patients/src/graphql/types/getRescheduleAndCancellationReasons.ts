/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getRescheduleAndCancellationReasons
// ====================================================

export interface getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons {
  __typename: "rescheduleAndCancellationReasons";
  rescheduleReasons: (string | null)[] | null;
  cancellationReasons: (string | null)[] | null;
}

export interface getRescheduleAndCancellationReasons {
  getRescheduleAndCancellationReasons: getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons | null;
}

export interface getRescheduleAndCancellationReasonsVariables {
  appointmentDateTimeInUTC: any;
}
