/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserState, BannerDisplayType } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetAllGroupBannersOfUser
// ====================================================

export interface GetAllGroupBannersOfUser_GetAllGroupBannersOfUser_response {
  __typename: "GroupPlanBannerType";
  _id: string | null;
  is_active: boolean | null;
  banner: string | null;
  banner_template_info: any | null;
  cta_action: any | null;
  meta: any | null;
  banner_display_type: BannerDisplayType;
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
  banner_context: string;
  user_state?: UserState | null;
  banner_display_type?: BannerDisplayType[] | null;
}
