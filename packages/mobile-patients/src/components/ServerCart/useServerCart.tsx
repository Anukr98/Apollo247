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
    serverCartItems,
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
  } = useShoppingCart();
  const { setPharmacyLocation } = useAppCommonData();
  const [userActionPayload, setUserActionPayload] = useState<any>(null);

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
          console.log('======= saveServerCart result: ', JSON.stringify(cartResponse));
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
        const saveCartResponse = result?.data?.fetchCart;
        // console.log('======= fetchServerCart result: ', JSON.stringify(saveCartResponse));
        if (saveCartResponse?.errorMessage) {
          throw saveCartResponse?.errorMessage;
        }
        if (saveCartResponse?.data?.patientId) {
          const cartResponse = saveCartResponse?.data;
          // console.log(
          //   '======= fetchServerCart result: ',
          //   JSON.stringify(cartResponse?.subscriptionDetails)
          // );
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        console.log('======= fetchServerCart error: ', error);
      });
  };

  const fetchReviewCart = () => {
    // console.log('fetchReviewCart cartInputData >>>> ', { patientId: currentPatient?.id });
    client
      .query({
        query: SERVER_CART_REVIEW_CART,
        variables: {
          patientId: currentPatient?.id,
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const saveCartResponse = result?.data?.reviewCart;
        if (saveCartResponse?.errorMessage) {
          throw saveCartResponse?.errorMessage;
        }
        if (saveCartResponse?.data?.patientId) {
          const cartResponse = saveCartResponse?.data;
          // console.log(
          //   '======= fetchReviewCart result: ',
          //   JSON.stringify(cartResponse?.subscriptionDetails)
          // );
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

  // const renderAlert = (message: string) => {
  //   showAphAlert!({
  //     title: string.common.uhOh,
  //     description: message,
  //   });
  // };

  return {
    setUserActionPayload,
    fetchServerCart,
    fetchReviewCart,
    fetchAddress,
  };
};
