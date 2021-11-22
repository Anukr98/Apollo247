/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { GetMedicineOrderCancelReasonsV2Input } from "./globalTypes";

// ====================================================
// GraphQL query operation: getMedicineOrderCancelReasonsV2
// ====================================================

export interface getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets_reasons_config {
  __typename: "CancelReasonConfig";
  userCommentRequired: boolean | null;
  commentMinLength: number | null;
  commentMaxLength: number | null;
}

export interface getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets_reasons_nudgeConfig {
  __typename: "CancelReasonNudgeConfig";
  enabled: boolean | null;
  message: string | null;
}

export interface getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets_reasons {
  __typename: "MedicineOrderCancelReason";
  isUserReason: boolean | null;
  description: string | null;
  sortOrder: number | null;
  reasonCode: string | null;
  displayMessage: string | null;
  config: getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets_reasons_config | null;
  nudgeConfig: getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets_reasons_nudgeConfig | null;
}

export interface getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets {
  __typename: "MedicineOrderCancelReasonBucket";
  id: string | null;
  reasons: (getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets_reasons | null)[] | null;
  sortOrder: number | null;
  bucketName: string | null;
}

export interface getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2 {
  __typename: "MedicineOrderCancelReasonResultV2";
  cancellationReasonBuckets: (getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2_cancellationReasonBuckets | null)[] | null;
}

export interface getMedicineOrderCancelReasonsV2 {
  getMedicineOrderCancelReasonsV2: getMedicineOrderCancelReasonsV2_getMedicineOrderCancelReasonsV2;
}

export interface getMedicineOrderCancelReasonsV2Variables {
  getMedicineOrderCancelReasonsV2Input: GetMedicineOrderCancelReasonsV2Input;
}
