import { useEffect, useState } from 'react';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  GET_PATIENT_ADDRESS_LIST,
  SERVER_CART_FETCH_CART,
  SERVER_CART_REVIEW_CART,
  SERVER_CART_SAVE_CART,
} from '@aph/mobile-patients/src/graphql/profiles';
import { CartInputData } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { formatAddressToLocation } from '@aph/mobile-patients/src/helpers/helperFunctions';

export const useServerCart = () => {
  const client = useApolloClient();
  const { currentPatient } = useAllCurrentPatients();
  const {
    setServerCartItems,
    setCartCircleSubscriptionId,
    setServerCartAmount,
    setCartCoupon,
    setCartAddressId,
    setCartTat,
    setCartPrescriptions,
    setCartSubscriptionDetails,
    setAddresses,
    deliveryAddressId,
    setDeliveryAddressId,
    setNoOfShipments,
    setServerCartErrorMessage,
    setServerCartLoading,
  } = useShoppingCart();
  const { setPharmacyLocation } = useAppCommonData();
  const [userActionPayload, setUserActionPayload] = useState<any>(null);
  const genericErrorMessage = 'Oops! Something went wrong.';

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
    setServerCartLoading?.(true);
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
          setServerCartErrorMessage?.(saveCartResponse?.errorMessage || genericErrorMessage);
          return;
        }
        if (saveCartResponse?.data?.patientId) {
          const cartResponse = saveCartResponse?.data;
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        setServerCartErrorMessage?.(error);
      })
      .finally(() => {
        setUserActionPayload(null);
        setServerCartLoading?.(false);
      });
  };

  const fetchServerCart = () => {
    setServerCartLoading?.(true);
    client
      .query({
        query: SERVER_CART_FETCH_CART,
        variables: {
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const fetchCartResponse = result?.data?.fetchCart;
        if (fetchCartResponse?.errorMessage) {
          setServerCartErrorMessage?.(fetchCartResponse?.errorMessage || genericErrorMessage);
          return;
        }
        if (fetchCartResponse?.data?.patientId) {
          const cartResponse = fetchCartResponse?.data;
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        setServerCartErrorMessage?.(error);
      })
      .finally(() => {
        setUserActionPayload(null);
        setServerCartLoading?.(false);
      });
  };

  const fetchReviewCart = () => {
    setServerCartLoading?.(true);
    client
      .query({
        query: SERVER_CART_REVIEW_CART,
        variables: {
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const reviewCartResponse = result?.data?.reviewCartPage;
        if (reviewCartResponse?.errorMessage) {
          setServerCartErrorMessage?.(reviewCartResponse?.errorMessage || genericErrorMessage);
          return;
        }
        if (reviewCartResponse?.data?.patientId) {
          const cartResponse = reviewCartResponse?.data;
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        setServerCartErrorMessage?.(error);
      })
      .finally(() => {
        setUserActionPayload(null);
        setServerCartLoading?.(false);
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
      if (cartResponse?.patientAddressId) setCartAddressId?.(cartResponse?.patientAddressId);
      setCartSubscriptionDetails?.(cartResponse?.subscriptionDetails);
      setNoOfShipments?.(cartResponse?.noOfShipments);
    } catch (error) {}
  };

  const fetchAddress = () => {
    try {
      client
        .query({
          query: GET_PATIENT_ADDRESS_LIST,
          variables: {
            patientId: currentPatient?.id,
          },
          fetchPolicy: 'no-cache',
        })
        .then((result) => {
          const { data } = result;
          const addressList = data.getPatientAddressList.addressList || [];
          setAddresses?.(addressList);
          const deliveryAddress = addressList.find(({ defaultAddress }) => defaultAddress === true);
          if (deliveryAddress && !deliveryAddressId) {
            setDeliveryAddressId && setDeliveryAddressId(deliveryAddress?.id);
          }
          setPharmacyLocation?.(formatAddressToLocation(deliveryAddress! || null));
        })
        .catch((error) => {});
    } catch (error) {
      // renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  };

  return {
    setUserActionPayload,
    fetchServerCart,
    fetchReviewCart,
    fetchAddress,
  };
};
