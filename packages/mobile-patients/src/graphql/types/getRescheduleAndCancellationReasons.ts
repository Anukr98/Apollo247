/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getRescheduleAndCancellationReasons
// ====================================================

export interface getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2_ctaOptions {
  __typename: "CTAOptions";
  ctas: (string | null)[] | null;
  displayText: string | null;
  userCommentsEnabled: boolean | null;
}

export interface getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2 {
  __typename: "CancellationReason";
  reason: string | null;
  isDirectCancellation: boolean | null;
  ctaOptions: getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2_ctaOptions | null;
}

export interface getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons {
  __typename: "rescheduleAndCancellationReasons";
  rescheduleReasons: (string | null)[] | null;
  cancellationReasons: (string | null)[] | null;
  cancellationReasonsv2: (getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons_cancellationReasonsv2 | null)[] | null;
}

export interface getRescheduleAndCancellationReasons {
  getRescheduleAndCancellationReasons: getRescheduleAndCancellationReasons_getRescheduleAndCancellationReasons | null;
}

export interface getRescheduleAndCancellationReasonsVariables {
  appointmentDateTimeInUTC: any;
}
