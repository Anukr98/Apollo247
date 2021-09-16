/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getInclusionsOfMultipleItems
// ====================================================

export interface getInclusionsOfMultipleItems_getInclusionsOfMultipleItems_inclusions {
  __typename: "DiagnosticInclusions";
  itemId: number;
  requiredAttachment: string;
  sampleRemarks: string;
  sampleTypeName: string;
  testParameters: string;
  name: string;
  testPreparationData: string | null;
}

export interface getInclusionsOfMultipleItems_getInclusionsOfMultipleItems {
  __typename: "getInclusionsResponse";
  inclusions: (getInclusionsOfMultipleItems_getInclusionsOfMultipleItems_inclusions | null)[] | null;
}

export interface getInclusionsOfMultipleItems {
  getInclusionsOfMultipleItems: getInclusionsOfMultipleItems_getInclusionsOfMultipleItems;
}

export interface getInclusionsOfMultipleItemsVariables {
  itemID: (number | null)[];
}
