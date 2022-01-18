import gql from 'graphql-tag';

export const GET_MEDICINE_ORDER_LIVE_TAT = gql`
  query getMedicineOrderLiveTat($orderAutoId: Int) {
    getMedicineOrderLiveTat(orderAutoId: $orderAutoId) {
      orderTat
    }
  }
`;
