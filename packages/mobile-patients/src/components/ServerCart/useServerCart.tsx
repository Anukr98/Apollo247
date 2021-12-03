import { useEffect, useState } from 'react';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useApolloClient } from 'react-apollo-hooks';
import { SERVER_CART_SAVE_CART } from '@aph/mobile-patients/src/graphql/profiles';
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
    // setSubscriptionDetails,
  } = useShoppingCart();
  const [userActionPayload, setUserActionPayload] = useState<any>(null);

  useEffect(() => {
    const cartInputData: CartInputData = {
      patientId: currentPatient?.id,
    };
    if (currentPatient?.id) saveServerCart(cartInputData); // to be called on update cart. replace with fetchServerCart()
  }, []);

  useEffect(() => {
    if (userActionPayload && currentPatient?.id) {
      const cartInputData: CartInputData = {
        ...userActionPayload,
        patientId: currentPatient?.id,
      };
      saveServerCart(cartInputData);
    }
  }, [userActionPayload, currentPatient?.id]);

  const saveServerCart = (cartInputData: CartInputData) => {
    console.log('cartInputData >>>> ', cartInputData);
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
          console.log('======= result: ', JSON.stringify(cartResponse?.couponDetails));
          setServerCartItems?.(cartResponse?.medicineOrderCartLineItems);
          setCartTat?.(cartResponse?.medicineOrderCartLineItems?.[0]?.tat);
          setCartCircleSubscriptionId?.(cartResponse?.subscriptionDetails?.userSubscriptionId);
          setServerCartAmount?.(cartResponse?.amount);
          setCartCoupon?.(cartResponse?.couponDetails);
          setCartPrescriptions?.(cartResponse?.prescriptionDetails);
          setCartAddressId?.('83e7f3b8-ba4e-44c1-8a5d-d211def51941');
          // setCartAddressId?.(cartResponse?.patientAddressId);
          // setSubscriptionDetails?.();
        }
      })
      .catch((error) => {
        console.log('======= error: ', error);
      })
      .finally(() => {
        setUserActionPayload(null);
      });
  };

  const fetchServerCart = () => {
    // make GQL query call
  };

  return {
    setUserActionPayload,
    fetchServerCart,
  };
};
