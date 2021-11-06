import { useEffect, useState } from 'react';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  SERVER_CART_FETCH_CART,
  SERVER_CART_REVIEW_CART,
  SERVER_CART_SAVE_CART,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CartInputData } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

export const useServerCart = () => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const {
    serverCartItems,
    setServerCartItems,
    setCartCircleSubscriptionId,
    setServerCartAmount,
    setCartCoupon,
    setCartAddressId,
    setCartTat,
    setCartPrescriptions,
    setCartSubscriptionDetails,
  } = useShoppingCart();
  const [userActionPayload, setUserActionPayload] = useState<any>(null);

  useEffect(() => {
    if (currentPatient?.id) fetchServerCart();
  }, []);

  useEffect(() => {
    if (userActionPayload && currentPatient?.id) {
      const cartInputData: CartInputData = {
        ...userActionPayload,
        patientId: currentPatient?.id,
      };
      saveServerCart(cartInputData);
    }
  }, [userActionPayload]);

  const saveServerCart = (cartInputData: CartInputData) => {
    console.log('saveServerCart cartInputData >>>> ', cartInputData);
    client
      .mutate({
        mutation: SERVER_CART_SAVE_CART,
        variables: {
          cartInputData,
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const saveCartResponse = result?.data?.saveCart;
        if (saveCartResponse?.errorMessage) {
          throw saveCartResponse?.errorMessage;
        }
        if (saveCartResponse?.data?.patientId) {
          const cartResponse = saveCartResponse?.data;
          console.log(
            '======= saveServerCart result: ',
            JSON.stringify(cartResponse?.subscriptionDetails)
          );
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        console.log('======= saveServerCart error: ', error);
      })
      .finally(() => {
        setUserActionPayload(null);
      });
  };

  const fetchServerCart = () => {
    console.log('fetchServerCart cartInputData >>>> ', { patientId: currentPatient?.id });
    client
      .query({
        query: SERVER_CART_FETCH_CART,
        variables: {
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const saveCartResponse = result?.data?.saveCart;
        if (saveCartResponse?.errorMessage) {
          throw saveCartResponse?.errorMessage;
        }
        if (saveCartResponse?.data?.patientId) {
          const cartResponse = saveCartResponse?.data;
          console.log(
            '======= fetchServerCart result: ',
            JSON.stringify(cartResponse?.subscriptionDetails)
          );
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        console.log('======= fetchServerCart error: ', error);
      });
  };

  const fetchReviewCart = () => {
    console.log('fetchReviewCart cartInputData >>>> ', { patientId: currentPatient?.id });
    client
      .query({
        query: SERVER_CART_REVIEW_CART,
        variables: {
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const saveCartResponse = result?.data?.saveCart;
        if (saveCartResponse?.errorMessage) {
          throw saveCartResponse?.errorMessage;
        }
        if (saveCartResponse?.data?.patientId) {
          const cartResponse = saveCartResponse?.data;
          console.log(
            '======= fetchReviewCart result: ',
            JSON.stringify(cartResponse?.subscriptionDetails)
          );
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        console.log('======= fetchReviewCart error: ', error);
      });
  };

  const setCartValues = (cartResponse: any) => {
    try {
      setServerCartItems?.(cartResponse?.medicineOrderCartLineItems);
      setCartTat?.(cartResponse?.medicineOrderCartLineItems?.[0]?.tat);
      setCartCircleSubscriptionId?.(cartResponse?.subscriptionDetails?.userSubscriptionId);
      setServerCartAmount?.(cartResponse?.amount);
      setCartCoupon?.(cartResponse?.couponDetails);
      setCartPrescriptions?.(cartResponse?.prescriptionDetails);
      setCartAddressId?.('83e7f3b8-ba4e-44c1-8a5d-d211def51941');
      setCartSubscriptionDetails?.(cartResponse?.subscriptionDetails);
    } catch (error) {}
  };

  return {
    setUserActionPayload,
    fetchServerCart,
    fetchReviewCart,
  };
};
