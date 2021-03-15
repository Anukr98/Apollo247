/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetHelpSectionQueries
// ====================================================

export interface GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries_queries_queries {
  __typename: "NeedHelpQuery";
  id: number | null;
  title: string | null;
  nonOrderQueries: (number | null)[] | null;
  queriesByOrderStatus: any | null;
}

export interface GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries_queries {
  __typename: "NeedHelpQuery";
  id: number | null;
  title: string | null;
  nonOrderQueries: (number | null)[] | null;
  queriesByOrderStatus: any | null;
  queries: (GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries_queries_queries | null)[] | null;
}

export interface GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries {
  __typename: "NeedHelpQuery";
  id: number | null;
  title: string | null;
  nonOrderQueries: (number | null)[] | null;
  queriesByOrderStatus: any | null;
  queries: (GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries_queries | null)[] | null;
}

export interface GetHelpSectionQueries_getHelpSectionQueries {
  __typename: "PharmaHelpResult";
  needHelpQueries: (GetHelpSectionQueries_getHelpSectionQueries_needHelpQueries | null)[] | null;
}

export interface GetHelpSectionQueries {
  getHelpSectionQueries: GetHelpSectionQueries_getHelpSectionQueries;
}
