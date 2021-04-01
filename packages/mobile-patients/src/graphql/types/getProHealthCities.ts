/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getProHealthCities
// ====================================================

export interface getProHealthCities_getProHealthCities_cityList {
  __typename: "ProhealthCity";
  regionId: number | null;
  cityName: string;
  id: string;
}

export interface getProHealthCities_getProHealthCities {
  __typename: "ProhealthCityDetails";
  cityList: (getProHealthCities_getProHealthCities_cityList | null)[] | null;
}

export interface getProHealthCities {
  getProHealthCities: getProHealthCities_getProHealthCities | null;
}
