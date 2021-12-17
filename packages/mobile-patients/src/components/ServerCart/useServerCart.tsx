import { useEffect, useState } from 'react';
import {
  EPrescription,
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useApolloClient } from 'react-apollo-hooks';
import {
  DELETE_SERVER_CART,
  GET_PATIENT_ADDRESS_LIST,
  SERVER_CART_FETCH_CART,
  SERVER_CART_REVIEW_CART,
  SERVER_CART_SAVE_CART,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  CartInputData,
  PrescriptionType,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { formatAddressToLocation } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getProductsByCategoryApi } from '@aph/mobile-patients/src/helpers/apiCalls';
import { Helpers } from '@aph/mobile-patients/src/components/MedicineCartPrescription';
import { USER_AGENT } from '@aph/mobile-patients/src/utils/AsyncStorageKey';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

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
    cartAddressId,
    setDeliveryAddressId,
    setNoOfShipments,
    setServerCartErrorMessage,
    serverCartLoading,
    setServerCartLoading,
    setCartSuggestedProducts,
    setCartLocationDetails,
    setCartPrescriptionType,
    cartLocationDetails,
    asyncPincode,
    addToCartSource,
    setAddToCartSource,
    pharmacyCircleAttributes,
    setTatDetailsForPrescriptionOptions,
    setCirclePlanSelected,
  } = useShoppingCart();
  const { axdcCode, pharmacyUserTypeAttribute } = useAppCommonData();
  const { setPharmacyLocation } = useAppCommonData();
  const [userActionPayload, setUserActionPayload] = useState<any>(null);
  const [userAgent, setUserAgent] = useState<string>('');
  const genericErrorMessage = 'Oops! Something went wrong.';

  useEffect(() => {
    if (!userAgent) {
      AsyncStorage.getItem(USER_AGENT).then((userAgent) => {
        if (userAgent) setUserAgent(userAgent);
      });
    }
  }, [userAgent]);

  useEffect(() => {
    if (userActionPayload && currentPatient?.id && userAgent) {
      const cartInputData: CartInputData = {
        ...userActionPayload,
        patientId: currentPatient?.id,
      };
      serverCartLoading === false ? saveServerCart(cartInputData) : {};
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
        context: {
          headers: {
            'User-Agent': userAgent,
          },
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
        setServerCartErrorMessage?.(genericErrorMessage);
      })
      .finally(() => {
        setUserActionPayload?.(null);
        setServerCartLoading?.(false);
      });
  };

  const fetchServerCart = (userAgentInput?: string) => {
    client
      .query({
        query: SERVER_CART_FETCH_CART,
        variables: {
          patientId: currentPatient?.id,
        },
        context: {
          headers: {
            'User-Agent': userAgentInput || userAgent,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const fetchCartResponse = result?.data?.fetchCart;
        if (fetchCartResponse?.errorMessage) {
          return;
        }
        if (fetchCartResponse?.data?.patientId) {
          const cartResponse = fetchCartResponse?.data;
          setCartValues(cartResponse);
        }
      })
      .catch((error) => {
        setServerCartErrorMessage?.(genericErrorMessage);
      })
      .finally(() => {
        setUserActionPayload?.(null);
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
        context: {
          headers: {
            'User-Agent': userAgent,
          },
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
        setServerCartErrorMessage?.(genericErrorMessage);
      })
      .finally(() => {
        setUserActionPayload?.(null);
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
      setCartPrescriptionType?.(cartResponse?.prescriptionType);
      setCartAddressId?.(cartResponse?.patientAddressId);
      setCartLocationDetails?.({
        pincode: cartResponse?.zipcode,
        latitude: cartResponse?.latitude,
        longitude: cartResponse?.longitude,
        city: cartResponse?.city,
        state: cartResponse?.state,
      });
      setCartSubscriptionDetails?.(cartResponse?.subscriptionDetails);
      if (
        cartResponse?.subscriptionDetails?.currentSellingPrice &&
        !cartResponse?.subscriptionDetails?.subscriptionApplied
      ) {
        setCirclePlanSelected?.(null);
      }
      setNoOfShipments?.(cartResponse?.noOfShipments);
      setTatDetailsForPrescriptionOptions?.({
        patientid: currentPatient?.id,
        userType: pharmacyUserTypeAttribute?.User_Type,
        tatCity: cartResponse?.medicineOrderCartLineItems?.[0]?.tatCity,
        tatType: cartResponse?.medicineOrderCartLineItems?.[0]?.storeType?.toUpperCase(),
        tatHours: cartResponse?.medicineOrderCartLineItems?.[0]?.tatDuration,
        items: cartResponse?.medicineOrderCartLineItems?.map((item) => item?.sku),
      });
    } catch (error) {}
  };

  const deleteServerCart = (paymentSuccess: boolean, paymentOrderId: string) => {
    setServerCartLoading?.(true);
    client
      .mutate({
        mutation: DELETE_SERVER_CART,
        variables: {
          patientId: currentPatient?.id,
          paymentSuccess,
          paymentOrderId,
        },
        context: {
          headers: {
            'User-Agent': userAgent,
          },
        },
        fetchPolicy: 'no-cache',
      })
      .then((result) => {
        const deleteCartResponse = result?.data?.deletecart;
        if (deleteCartResponse?.success) fetchReviewCart();
      })
      .catch((error) => {
        setServerCartErrorMessage?.(genericErrorMessage);
      })
      .finally(() => {
        setServerCartLoading?.(false);
      });
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
          if (deliveryAddress && !cartAddressId) {
            setDeliveryAddressId && setDeliveryAddressId(deliveryAddress?.id);
          }
          setPharmacyLocation?.(formatAddressToLocation(deliveryAddress! || null));
        })
        .catch((error) => {});
    } catch (error) {
      setServerCartErrorMessage?.('Something went wrong, unable to fetch addresses');
    }
  };

  const fetchProductSuggestions = async () => {
    const categoryId = AppConfig.Configuration.PRODUCT_SUGGESTIONS_CATEGORYID;
    const pageCount = AppConfig.Configuration.PRODUCT_SUGGESTIONS_COUNT;
    try {
      const response = await getProductsByCategoryApi(
        categoryId,
        pageCount,
        null,
        null,
        axdcCode,
        cartLocationDetails?.pincode || asyncPincode?.pincode
      );
      const products = response?.data?.products.slice(0, 15) || [];
      setCartSuggestedProducts?.(products);
    } catch (error) {}
  };

  const uploadPhysicalPrescriptionsToServerCart = async (
    physicalPrescriptions: PhysicalPrescription[]
  ) => {
    try {
      setUserActionPayload?.(null);
      if (physicalPrescriptions?.length) {
        setServerCartLoading?.(true);
        // upload physical prescriptions and get prism file id
        const updatedPrescriptions = await Helpers.updatePrescriptionUrls(
          client,
          currentPatient?.id,
          physicalPrescriptions
        );
        const prescriptionsToUpload = updatedPrescriptions.map(
          (prescription: PhysicalPrescription) => {
            return {
              prescriptionImageUrl: prescription?.uploadedUrl,
              prismPrescriptionFileId: prescription?.prismPrescriptionFileId,
              uhid: currentPatient?.uhid,
              meta: {
                fileName: prescription?.title,
                fileType: prescription?.fileType,
              },
            };
          }
        );
        const cartInputData: CartInputData = {
          ...{
            prescriptionType: PrescriptionType.UPLOADED,
            prescriptionDetails: prescriptionsToUpload,
          },
          patientId: currentPatient?.id,
        };
        saveServerCart(cartInputData);
        setServerCartLoading?.(false);
      } else {
        setUserActionPayload?.({
          prescriptionType: PrescriptionType.UPLOADED,
        });
      }
    } catch (error) {
      setServerCartLoading?.(false);
      setServerCartErrorMessage?.('Error occurred while uploading prescriptions.');
    }
  };

  const uploadEPrescriptionsToServerCart = (
    ePrescriptionsToBeUploaded: EPrescription[],
    cartItemsToAdd?: any[]
  ) => {
    setUserActionPayload?.(null);
    if (ePrescriptionsToBeUploaded?.length) {
      const prescriptionsToUpload =
        ePrescriptionsToBeUploaded.map((presToAdd: EPrescription) => {
          return {
            prescriptionImageUrl: presToAdd?.uploadedUrl,
            prismPrescriptionFileId: presToAdd?.prismPrescriptionFileId || presToAdd?.id,
            uhid: currentPatient?.uhid,
            appointmentId: presToAdd?.appointmentId,
            meta: {
              doctorName: presToAdd?.doctorName,
              forPatient: presToAdd?.forPatient,
              medicines: presToAdd?.medicines,
              date: presToAdd?.date,
            },
          };
        }) || [];
      const cartInputData: CartInputData = {
        ...{
          prescriptionType: PrescriptionType.UPLOADED,
          prescriptionDetails: prescriptionsToUpload,
          medicineOrderCartLineItems: cartItemsToAdd?.length ? cartItemsToAdd : [],
        },
        patientId: currentPatient?.id,
      };
      saveServerCart(cartInputData);
    } else {
      setUserActionPayload?.({
        prescriptionType: PrescriptionType.UPLOADED,
      });
    }
  };

  const removePrescriptionFromCart = (id: string) => {
    setUserActionPayload?.({
      prescriptionDetails: {
        prismPrescriptionFileId: id,
        prescriptionImageUrl: '',
      },
    });
  };

  return {
    setUserActionPayload,
    fetchServerCart,
    saveServerCart,
    fetchReviewCart,
    deleteServerCart,
    fetchAddress,
    fetchProductSuggestions,
    uploadPhysicalPrescriptionsToServerCart,
    uploadEPrescriptionsToServerCart,
    removePrescriptionFromCart,
  };
};
