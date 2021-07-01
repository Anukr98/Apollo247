/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getRecommendedProductsList
// ====================================================

export interface getRecommendedProductsList_getRecommendedProductsList_recommendedProducts {
  __typename: "RecommendedProducts";
  productSku: string | null;
  productName: string | null;
  productImage: string | null;
  productPrice: string | null;
  productSpecialPrice: string | null;
  isPrescriptionNeeded: string | null;
  categoryName: string | null;
  status: string | null;
  mou: string | null;
  urlKey: string | null;
}

export interface getRecommendedProductsList_getRecommendedProductsList {
  __typename: "RecommendedProductsListResult";
  recommendedProducts: (getRecommendedProductsList_getRecommendedProductsList_recommendedProducts | null)[] | null;
}

export interface getRecommendedProductsList {
  getRecommendedProductsList: getRecommendedProductsList_getRecommendedProductsList;
}

export interface getRecommendedProductsListVariables {
  patientUhid: string;
}
