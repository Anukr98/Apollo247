/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: getSavedCardList
// ====================================================

export interface getSavedCardList_getSavedCardList_cards {
  __typename: "saveCardInfo";
  card_number: string | null;
  card_isin: string | null;
  card_exp_year: string | null;
  card_exp_month: string | null;
  card_type: string | null;
  card_issuer: string | null;
  card_brand: string | null;
  name_on_card: string | null;
  expired: boolean | null;
  card_token: string | null;
}

export interface getSavedCardList_getSavedCardList {
  __typename: "cardList";
  customer_id: string | null;
  merchantId: string | null;
  cards: (getSavedCardList_getSavedCardList_cards | null)[];
}

export interface getSavedCardList {
  getSavedCardList: getSavedCardList_getSavedCardList;
}

export interface getSavedCardListVariables {
  customer_id: string;
}
