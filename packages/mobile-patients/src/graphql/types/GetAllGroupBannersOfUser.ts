/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GetAllGroupBannersOfUser
// ====================================================

export interface GetAllGroupBannersOfUser_GetAllGroupBannersOfUser_response {
  __typename: "GroupPlanBannerType";
  _id: string | null;
  is_active: boolean | null;
  banner: string;
  banner_template_info: any | null;
  cta_action: any | null;
  meta: any | null;
}

export interface GetAllGroupBannersOfUser_GetAllGroupBannersOfUser {
  __typename: "GetAllGroupBannersResponse";
  code: number;
  success: boolean;
  message: string | null;
  response: GetAllGroupBannersOfUser_GetAllGroupBannersOfUser_response[] | null;
}

export interface GetAllGroupBannersOfUser {
  GetAllGroupBannersOfUser: GetAllGroupBannersOfUser_GetAllGroupBannersOfUser;
}

export interface GetAllGroupBannersOfUserVariables {
  mobile_number: string;
}
