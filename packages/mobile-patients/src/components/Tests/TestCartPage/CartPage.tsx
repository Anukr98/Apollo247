import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  aphConsole,
  extractPatientDetails,
  formatAddress,
  formatAddressWithLandmark,
  g,
  isAddressLatLngInValid,
  isDiagnosticSelectedCartEmpty,
  isEmptyObject,
  nameFormater,
  postAppsFlyerEvent,
  postFirebaseEvent,
  setAsyncPharmaLocation,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { AccessLocation } from '@aph/mobile-patients/src/components/Medicines/Components/AccessLocation';
import { getPricesForItem, sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  makeAdressAsDefault,
  makeAdressAsDefaultVariables,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import {
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  SET_DEFAULT_ADDRESS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  DiagnosticData,
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  DiagnosticLineItem,
  Gender,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { FirebaseEventName, FirebaseEvents } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import {
  DiagnosticAddToCartClicked,
  DiagnosticRemoveFromCartClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import { CartItemCard } from '@aph/mobile-patients/src/components/Tests/components/CartItemCard';
import { diagnosticServiceability } from '@aph/mobile-patients/src/helpers/clientCalls';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  DIAGNOSTIC_GROUP_PLAN,
  getDiagnosticCartItemReportGenDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';

type Address = savePatientAddress_savePatientAddress_patientAddress;
type orderListLineItems = getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems;

export interface CartPageProps extends NavigationScreenProps {}

export const CartPage: React.FC<CartPageProps> = (props) => {
  const {
    cartItems,
    isDiagnosticCircleSubscription,
    modifiedOrder,
    addresses,
    deliveryAddressId,
    setAddresses,
    setDeliveryAddressId,
    setDiagnosticSlot,
    setCartPagePopulated,
    removeCartItem,
    updateCartItem,
    updatePatientCartItem,
    setCartItems,
    selectedPatient,
    deliveryAddressCityId,
    setDeliveryAddressCityId,
    duplicateItemsArray,
    setDuplicateItemsArray,
    patientCartItems,
    setPatientCartItems,
    removePatientCartItem,
    setModifiedOrder,
    setModifyHcCharges,
    addPatientCartItem,
    setModifiedOrderItemIds,
    setHcCharges,
    setAreaSelected,
    setPinCode,
    modifiedPatientCart,
    setModifiedPatientCart,
    setDistanceCharges,
  } = useDiagnosticsCart();

  const { setAddresses: setMedAddresses } = useShoppingCart();

  const {
    locationDetails,
    diagnosticLocation,
    setDiagnosticServiceabilityData,
    setDiagnosticLocation,
    diagnosticServiceabilityData,
  } = useAppCommonData();

  const { setLoading, showAphAlert, hideAphAlert, loading } = useUIElements();
  const client = useApolloClient();
  const sourceScreen = props.navigation.getParam('comingFrom');
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [addressCityId, setAddressCityId] = useState<string>(deliveryAddressCityId);
  const [reportGenDetails, setReportGenDetails] = useState<any>([]);
  const [alsoAddListData, setAlsoAddListData] = useState<any>([]);
  const [duplicateNameArray, setDuplicateNameArray] = useState(duplicateItemsArray as any);
  const [showInclusions, setShowInclusions] = useState<boolean>(false);
  const [isServiceable, setIsServiceable] = useState<boolean>(false);
  const [showNonServiceableText, setShowNonServiceableText] = useState<boolean>(false);
  const [showPriceMismatch, setShowPriceMismatch] = useState<boolean>(false);
  const cartItemsWithId = cartItems?.map((item) => Number(item?.id!));
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const getAddress = addresses?.find((item) => item?.id == deliveryAddressId);
  const getDefaultAddress = !!getAddress
    ? getAddress
    : addresses?.find((item) => item?.defaultAddress);
  const selectedAddr = !!getDefaultAddress ? getDefaultAddress : addresses?.[0];
  //if no deliveryAddressId is then , select the first address/ or default address

  const isCartEmpty = isDiagnosticSelectedCartEmpty(
    isModifyFlow ? modifiedPatientCart : patientCartItems
  );

  const addressText = isModifyFlow
    ? formatAddressWithLandmark(modifiedOrder?.patientAddressObj) || ''
    : selectedAddr
    ? formatAddressWithLandmark(selectedAddr) || ''
    : '';

  var pricesForItemArray;
  var modifyPricesForItemArray;
  var patientCartItemsCopy = JSON.parse(JSON.stringify(isCartEmpty));

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setIsFocused(true);
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const willBlur = props.navigation.addListener('willBlur', (payload) => {
      setIsFocused(false);
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      willBlur && willBlur.remove();
    };
  }, []);

  function handleBack() {
    if (isModifyFlow) {
      showAphAlert?.({
        title: string.common.hiWithSmiley,
        description: string.diagnostics.modifyDiscardText,
        unDismissable: true,
        CTAs: [
          {
            text: 'DISCARD',
            onPress: () => {
              hideAphAlert?.();
              clearModifyDetails();
            },
            type: 'orange-button',
          },
          {
            text: 'CANCEL',
            onPress: () => {
              hideAphAlert?.();
            },
            type: 'orange-button',
          },
        ],
      });
    } else {
      props.navigation.goBack();
    }

    return true;
  }

  function clearModifyDetails() {
    setModifiedOrder?.(null);
    setModifyHcCharges?.(0);
    setModifiedOrderItemIds?.([]);
    setHcCharges?.(0);
    setDistanceCharges?.(0);
    setModifiedPatientCart?.([]);
    //go back to homepage
    props.navigation.navigate('TESTS', { focusSearch: true });
  }

  useEffect(() => {
    setDuplicateNameArray(duplicateItemsArray);
    setShowInclusions(true);
  }, [duplicateItemsArray]);

  useEffect(() => {
    const getDeliveryAddressId = selectedAddr?.id;
    deliveryAddressId == '' && setDeliveryAddressId?.(getDeliveryAddressId);
    if (
      ((isModifyFlow && modifiedPatientCart?.length > 0) || deliveryAddressId != '') &&
      isFocused
    ) {
      setIsServiceable(false);
      setShowNonServiceableText(false);
      setShowPriceMismatch(false);
      getAddressServiceability();
    }
  }, [addresses, isFocused]);

  useEffect(() => {
    if (cartItems?.length > 0 && cartItemsWithId?.length > 0) {
      fetchTestReportGenDetails(cartItemsWithId);
    }
  }, [cartItems?.length, addressCityId]);

  const getDiagnosticsAvailability = (
    cityIdForAddress: number,
    cartItems?: DiagnosticsCartItem[],
    duplicateItem?: any,
    comingFrom?: string
  ) => {
    const itemIds = comingFrom ? duplicateItem : cartItems?.map((item) => parseInt(item?.id));
    return client.query<
      findDiagnosticsByItemIDsAndCityID,
      findDiagnosticsByItemIDsAndCityIDVariables
    >({
      query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
      context: {
        sourceHeaders,
      },
      variables: { cityID: cityIdForAddress, itemIDs: itemIds! },
      fetchPolicy: 'no-cache',
    });
  };

  const fetchTestReportGenDetails = async (_cartItemId: string | number[]) => {
    try {
      const removeSpaces =
        typeof _cartItemId == 'string' ? _cartItemId.replace(/\s/g, '').split(',') : null;
      const listOfIds =
        typeof _cartItemId == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : _cartItemId;
      const res: any = await getDiagnosticCartItemReportGenDetails(
        listOfIds?.toString() || _cartItemId?.toString()
      );
      if (res?.data?.success) {
        const result = g(res, 'data', 'data');
        const widgetsData = g(res, 'data', 'widget_data', '0', 'diagnosticWidgetData');
        setReportGenDetails(result || []);
        const _itemIds = widgetsData?.map((item: any) => Number(item?.itemId));
        const _filterItemIds = _itemIds?.filter((val: any) => !cartItemsWithId?.includes(val));

        client
          .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
            query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
            context: {
              sourceHeaders,
            },
            variables: {
              cityID: Number(addressCityId) || AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID,
              itemIDs: _filterItemIds,
            },
            fetchPolicy: 'no-cache',
          })
          .then(({ data }) => {
            const diagnosticItems =
              g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
            let _diagnosticWidgetData: any = [];
            widgetsData?.forEach((_widget: any) => {
              diagnosticItems?.forEach((_diagItems) => {
                if (_widget?.itemId == _diagItems?.itemId) {
                  _diagnosticWidgetData?.push({
                    ..._widget,
                    diagnosticPricing: _diagItems?.diagnosticPricing,
                    packageCalculatedMrp: _diagItems?.packageCalculatedMrp,
                  });
                }
              });
            });
            setAlsoAddListData(_diagnosticWidgetData); //widget add list.
          })
          .catch((error) => {
            setAlsoAddListData([]);
            CommonBugFender('CartPage_fetchTestReportGenDetails', error);
          });
      } else {
        setAlsoAddListData([]);
        setReportGenDetails([]);
      }
    } catch (e) {
      CommonBugFender('CartPage_fetchTestReportGenDetails', e);
      setAlsoAddListData([]);
      setReportGenDetails([]);
    }
  };

  const errorAlert = (description?: string) => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: description || 'Unable to fetch test details.',
    });
  };

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert?.();
    setCartItems?.(
      cartItems?.filter((cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id))
    );
  };
  const removeDisabledPatientCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert?.();

    const newObj = patientCartItems?.map((item) => {
      const patientCartItemsObj: DiagnosticPatientCartItem = {
        patientId: item?.patientId,
        cartItems: item?.cartItems?.filter(
          (cItem) => !disabledCartItemIds?.find((dItem) => dItem == cItem?.id)
        ),
      };
      //add a check, if disabledItem is not present & isSelected is false then remove it
      return patientCartItemsObj;
    });

    setPatientCartItems?.(newObj);
  };

  console.log({ modifiedPatientCart });

  function updateModifiedPatientCartItem(updatedObject: any) {
    const foundIndex =
      !!modifiedPatientCart &&
      modifiedPatientCart?.[0]?.cartItems?.findIndex((item) => item?.id == updatedObject?.id);

    if (foundIndex !== -1) {
      modifiedPatientCart[0].cartItems[foundIndex] = updatedObject;
    }
    setModifiedPatientCart?.(modifiedPatientCart?.slice(0));
  }

  const updatePricesInCart = (results: any) => {
    if (results?.length == 0) {
      setLoading?.(false);
    }
    const disabledCartItems = cartItems?.filter(
      (cartItem) =>
        !results?.find(
          (d: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics) =>
            `${d?.itemId}` == cartItem?.id
        )
    );
    let isItemDisable = false,
      isPriceChange = false;
    if (cartItems?.length > 0) {
      cartItems?.map((cartItem) => {
        const isItemInCart = results?.findIndex(
          (item: any) => String(item?.itemId) === String(cartItem?.id)
        );

        if (isItemInCart !== -1) {
          const pricesForItem = getPricesForItem(
            results?.[isItemInCart]?.diagnosticPricing,
            results?.[isItemInCart]?.packageCalculatedMrp!
          );

          // if all the groupPlans are inactive, then only don't show
          if (!pricesForItem?.itemActive) {
            return null;
          }

          const specialPrice = pricesForItem?.specialPrice!;
          const price = pricesForItem?.price!; //more than price (black)
          const circlePrice = pricesForItem?.circlePrice!;
          const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
          const discountPrice = pricesForItem?.discountPrice!;
          const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
          const planToConsider = pricesForItem?.planToConsider;

          const promoteCircle = pricesForItem?.promoteCircle; //if circle discount is more
          const promoteDiscount = pricesForItem?.promoteDiscount; // if special discount is more than others.

          //removed comparison of circle/discount/prices
          const priceToCompare =
            isDiagnosticCircleSubscription && promoteCircle
              ? circleSpecialPrice
              : promoteDiscount
              ? discountSpecialPrice
              : specialPrice || price;

          let cartPriceToCompare = 0;
          if (
            isDiagnosticCircleSubscription &&
            cartItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
          ) {
            cartPriceToCompare = Number(cartItem?.circleSpecialPrice);
          } else if (cartItem?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT) {
            cartPriceToCompare = Number(cartItem?.discountSpecialPrice);
          } else {
            cartPriceToCompare = Number(cartItem?.specialPrice || cartItem?.price);
          }
          if (priceToCompare !== cartPriceToCompare) {
            //mrp
            //show the prices changed pop-over
            isPriceChange = true;
            setShowPriceMismatch(true);
            let updatedObject = {
              id: results?.[isItemInCart]
                ? String(results?.[isItemInCart]?.itemId)
                : String(cartItem?.id),
              name: results?.[isItemInCart]?.itemName || '',
              price: price,
              specialPrice: specialPrice || price,
              circlePrice: circlePrice,
              circleSpecialPrice: circleSpecialPrice,
              discountPrice: discountPrice,
              discountSpecialPrice: discountSpecialPrice,
              mou:
                results?.[isItemInCart]?.inclusions !== null
                  ? results?.[isItemInCart]?.inclusions.length
                  : 1,
              thumbnail: cartItem?.thumbnail,
              groupPlan: planToConsider?.groupPlan,
              packageMrp: results?.[isItemInCart]?.packageCalculatedMrp,
              inclusions:
                results?.[isItemInCart]?.inclusions == null
                  ? [Number(results?.[isItemInCart]?.itemId)]
                  : results?.[isItemInCart]?.inclusions,
              collectionMethod: TEST_COLLECTION_TYPE.HC,
              isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
            };

            updateCartItem?.(updatedObject);
            updatePatientCartItem?.(updatedObject);
            isModifyFlow && updateModifiedPatientCartItem?.(updatedObject);
          }
          setLoading?.(false);
        }
        //if items not available
        if (disabledCartItems?.length) {
          isItemDisable = true;
          const disabledCartItemIds = disabledCartItems?.map((item) => item?.id);
          setLoading?.(false);
          removeDisabledCartItems(disabledCartItemIds);
          removeDisabledPatientCartItems(disabledCartItemIds);
          setShowPriceMismatch(true);
        }
      });
      if (!isItemDisable && !isPriceChange) {
        isPriceChange = false;
        isItemDisable = false;
        setLoading?.(false);
      }
    }
  };

  async function getAddressServiceability() {
    //check in case of modify
    const selectedAddress = isModifyFlow ? modifiedOrder?.patientAddressObj : selectedAddr;
    setPinCode?.(selectedAddr?.zipcode!);
    //on changing the address
    let obj = {} as DiagnosticData;
    setLoading?.(true);
    //pick from delivery address id. //since it is reflecting late
    try {
      const serviceabilityResponse = await diagnosticServiceability(
        client,
        Number(selectedAddress?.latitude),
        Number(selectedAddress?.longitude)
      );
      console.log({ serviceabilityResponse });
      if (serviceabilityResponse?.data?.getDiagnosticServiceability?.status) {
        const getServiceableResponse =
          serviceabilityResponse?.data?.getDiagnosticServiceability?.serviceability;
        if (!!getServiceableResponse) {
          obj = {
            cityId: getServiceableResponse?.cityID?.toString() || '0',
            stateId: getServiceableResponse?.stateID?.toString() || '0',
            state: getServiceableResponse?.state || '',
            city: getServiceableResponse?.city || '',
          };
          //serviceable
          setDeliveryAddressCityId?.(String(getServiceableResponse?.cityID));
          setDiagnosticServiceabilityData?.(obj);
          setIsServiceable(true);
          setShowNonServiceableText(false);
          //call prices api.
          getDiagnosticsAvailability(getServiceableResponse?.cityID!, cartItems)
            .then(({ data }) => {
              const diagnosticItems =
                g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
              console.log({ diagnosticItems });
              updatePricesInCart(diagnosticItems);
              patientCartItems?.length == 0 && setLoading?.(false);
            })
            .catch((e) => {
              console.log({ e });
              CommonBugFender('AddPatients_getAddressServiceability_getDiagnosticsAvailability', e);
              setLoading?.(false);
              errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
            });
        } else {
          //non-serviceable
          setLoading?.(false);
          setIsServiceable(false);
          setShowNonServiceableText(true);
        }
      } else {
        setLoading?.(false);
        setIsServiceable(false);
        setShowNonServiceableText(true);
      }
    } catch (error) {
      CommonBugFender('AddPatients_getAddressServiceability', error);
      setLoading?.(false);
      setIsServiceable(false);
      setShowNonServiceableText(true);
    }
  }

  function AddressSelectedEvent(address: savePatientAddress_savePatientAddress_patientAddress) {
    const firebaseAttributes: FirebaseEvents[FirebaseEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS] = {
      DeliveryAddress: formatAddress(address),
      Pincode: address?.zipcode || '',
      LOB: 'Diagnostics',
    };
    postAppsFlyerEvent(
      AppsFlyerEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS,
      firebaseAttributes
    );
    postFirebaseEvent(
      FirebaseEventName.DIAGNOSTIC_CART_ADDRESS_SELECTED_SUCCESS,
      firebaseAttributes
    );
  }

  const formatAddressToLocation = (address: Address): LocationData => ({
    displayName: address?.city!,
    latitude: address?.latitude!,
    longitude: address?.longitude!,
    area: '',
    city: address?.city!,
    state: address?.state!,
    stateCode: address?.stateCode!,
    country: '',
    pincode: address?.zipcode!,
    lastUpdated: new Date().getTime(),
  });

  async function setDefaultAddress(address: Address) {
    try {
      const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(address);
      if (isSelectedAddressWithNoLatLng) {
        //show the error
        renderAlert(string.diagnostics.updateAddressLatLngMessage, 'updateLocation', address);
      } else {
        setLoading?.(true);
        hideAphAlert?.();
        const response = await client.query<makeAdressAsDefault, makeAdressAsDefaultVariables>({
          query: SET_DEFAULT_ADDRESS,
          variables: { patientAddressId: address?.id },
          fetchPolicy: 'no-cache',
        });
        const { data } = response;
        const patientAddress = data?.makeAdressAsDefault?.patientAddress;
        const updatedAddresses = addresses.map((item) => ({
          ...item,
          defaultAddress: patientAddress?.id == item.id ? patientAddress?.defaultAddress : false,
        }));
        setAddresses?.(updatedAddresses);
        setMedAddresses?.(updatedAddresses);
        patientAddress?.defaultAddress && setDeliveryAddressId?.(patientAddress?.id);
        setDiagnosticSlot?.(null);
        const deliveryAddress = updatedAddresses.find(({ id }) => patientAddress?.id == id);
        setDiagnosticLocation?.(formatAddressToLocation(deliveryAddress! || null));
      }
    } catch (error) {
      aphConsole.log({ error });
      setLoading?.(false);
      CommonBugFender('setDefaultAddress_TestsCart', error);
      showAphAlert?.({
        title: string.common.uhOh,
        description: string.common.unableToSetDeliveryAddress,
      });
    }
  }

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={isModifyFlow ? string.diagnostics.modifyHeader : 'CART'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const renderAlert = (message: string, source?: string, address?: any) => {
    if (!!source && !!address) {
      showAphAlert?.({
        unDismissable: true,
        title: string.common.uhOh,
        description: message,
        onPressOk: () => {
          hideAphAlert?.();
          props.navigation.push(AppRoutes.AddAddressNew, {
            KeyName: 'Update',
            addressDetails: address,
            ComingFrom: AppRoutes.TestsCart,
            updateLatLng: true,
            source: 'Diagnostics Cart' as AddressSource,
          });
        },
      });
    } else {
      setLoading?.(false);
      showAphAlert?.({
        title: string.common.uhOh,
        description: message,
      });
    }
  };

  function showAddressPopup() {
    return showAphAlert?.({
      removeTopIcon: true,
      onPressOutside: () => {
        hideAphAlert?.();
      },
      children: (
        <AccessLocation
          source={AppRoutes.Tests}
          hidePincodeCurrentLocation
          addresses={addresses}
          onPressSelectAddress={(_address) => {
            CommonLogEvent(AppRoutes.TestsCart, 'Check service availability');
            setDefaultAddress(_address);
            const tests = cartItems?.filter(
              (item) => item.collectionMethod == TEST_COLLECTION_TYPE.CENTER
            );
            const isSelectedAddressWithNoLatLng = isAddressLatLngInValid(_address);
            hideAphAlert?.();

            if (tests?.length) {
              showAphAlert?.({
                title: string.common.uhOh,
                description: `${(currentPatient && currentPatient.firstName) ||
                  'Hi'}, since your cart includes tests (${tests
                  .map((item) => item.name)
                  .join(
                    ', '
                  )}), that can only be done at the centre, we request you to get all tests in your cart done at the centre of your convenience. Please proceed to select.`,
              });
            } else {
              if (isSelectedAddressWithNoLatLng) {
                //show the error
                renderAlert(
                  string.diagnostics.updateAddressLatLngMessage,
                  'updateLocation',
                  _address
                );
              } else {
                AddressSelectedEvent(_address);
                setDeliveryAddressId?.(_address?.id);
                setCartPagePopulated?.(false);
                setAsyncPharmaLocation(_address);
                if (deliveryAddressId !== _address?.id) {
                  setDiagnosticSlot?.(null);
                  setCartPagePopulated?.(false);
                }
              }
            }
          }}
          onPressEditAddress={(_address) => {
            _navigateToEditAddress('Update', _address, AppRoutes.TestsCart);
            hideAphAlert?.();
          }}
          onPressAddAddress={() => {
            _onPressAddAddress();
            hideAphAlert?.();
          }}
          onPressCurrentLocaiton={() => {}}
          onPressPincode={() => {}}
        />
      ),
    });
  }

  function _onPressAddAddress() {
    postPharmacyAddNewAddressClick('Diagnostics Cart');
    props.navigation.navigate(AppRoutes.AddAddressNew, {
      addOnly: true,
      source: 'Diagnostics Cart' as AddressSource,
    });
    setDiagnosticSlot && setDiagnosticSlot(null);
  }

  const _navigateToEditAddress = (dataname: string, address: any, comingFrom: string) => {
    props.navigation.push(AppRoutes.AddAddressNew, {
      KeyName: dataname,
      addressDetails: address,
      ComingFrom: comingFrom,
      source: 'Diagnostics Cart' as AddressSource,
    });
  };

  const renderAddressSection = () => {
    return (
      <View style={{ marginTop: 16 }}>
        <Text style={styles.addressHeadingText}>{string.diagnostics.homeVisitText}</Text>
        <View style={styles.addressOuterView}>
          <View style={styles.addressTextView}>
            <Text style={styles.addressTextStyle}>{addressText}</Text>
            {isModifyFlow ? null : (
              <Text style={styles.changeTextStyle} onPress={() => showAddressPopup()}>
                {string.diagnostics.changeText}
              </Text>
            )}
          </View>
        </View>
        {showNonServiceableText ? renderInfoMessage() : null}
        {showPriceMismatch ? renderMismatchPrice() : null}
      </View>
    );
  };

  const renderInfoMessage = () => {
    return (
      <InfoMessage
        content={string.diagnosticsCartPage.nonServiceableText}
        textStyle={[styles.textStyle, { color: '#FF637B' }]}
        iconStyle={styles.iconStyle}
        containerStyle={styles.infoContainerStyle}
        isCard={false}
      />
    );
  };

  const renderMismatchPrice = () => {
    return (
      <InfoMessage
        content={string.diagnostics.pricesChangedMessage}
        textStyle={[styles.textStyle, { color: theme.colors.SHERPA_BLUE, opacity: 0.7 }]}
        iconStyle={[styles.iconStyle, { tintColor: 'rgb(90,175,252)' }]}
        containerStyle={[styles.infoContainerStyle, { backgroundColor: '#E0F0FF' }]}
        isCard={false}
      />
    );
  };

  function _navigateToHomePage() {
    DiagnosticAddToCartClicked();
    props.navigation.navigate('TESTS', { focusSearch: false });
  }

  function _navigateToSearch() {
    DiagnosticAddToCartClicked();
    props.navigation.navigate(AppRoutes.SearchTestScene, {
      searchText: '',
    });
  }

  const renderAddTestOption = () => {
    return (
      <View style={{ marginTop: 16 }}>
        <Button
          title={'+ ADD TESTS'}
          onPress={() => (isModifyFlow ? _navigateToSearch() : _navigateToHomePage())}
          style={styles.addButtonStyle}
          titleTextStyle={styles.addButtonTitleStyle}
        />
      </View>
    );
  };

  const onRemoveCartItem = ({ id, name }: DiagnosticsCartItem, patientId: string) => {
    removeCartItem?.(id);
    removePatientCartItem?.(patientId, id);

    if (isModifyFlow) {
      const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(id));
      setModifiedPatientCart?.([
        {
          patientId: modifiedOrder?.patientId,
          cartItems: newCartItems,
        },
      ]);
    }

    const newCartItems = cartItems?.filter((item) => Number(item?.id) !== Number(id));

    setCartItems?.(newCartItems);
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      DiagnosticRemoveFromCartClicked(
        id,
        name,
        addresses?.[selectedAddressIndex]?.zipcode!,
        'Customer'
      );
    } else {
      DiagnosticRemoveFromCartClicked(
        id,
        name,
        diagnosticLocation?.pincode! || locationDetails?.pincode!,
        'Customer'
      );
    }
  };

  const keyExtractor = useCallback((_, index: number) => `${index}`, []);

  const renderSeparator = () => {
    return <Spearator style={{ height: 2 }} />;
  };

  const renderPatientName = (name: string, genderAgeText: string, salutation: string) => {
    return (
      <View style={styles.patientNameView}>
        <View style={{ width: '72%' }}>
          <Text style={styles.patientNameText}>
            {salutation} {name}
          </Text>
        </View>
        {!!genderAgeText && <Text style={styles.patientNameText}>{genderAgeText}</Text>}
      </View>
    );
  };

  const renderCartItems = () => {
    const filterPatients =
      isModifyFlow && !!modifiedPatientCart && modifiedPatientCart?.length > 0
        ? modifiedPatientCart
        : !!patientCartItems && patientCartItems?.filter((item) => item?.cartItems?.length > 0);

    return (
      <View style={{ marginTop: 16, marginBottom: 150 }}>
        {!!filterPatients &&
          filterPatients?.map((pCartItem) => {
            const getPatient = allCurrentPatients?.find(
              (item: any) => item?.id === pCartItem?.patientId
            );
            const { patientName, genderAgeText, patientSalutation } = extractPatientDetails(
              getPatient
            );
            const patientItems = pCartItem?.cartItems?.filter((cItem) => cItem?.isSelected);

            return (
              <>
                {!!patientName && !!patientItems && patientItems?.length > 0
                  ? renderPatientName(patientName, genderAgeText, patientSalutation)
                  : null}
                {!!patientItems && patientItems?.length > 0 && (
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    extraData={patientItems}
                    style={styles.cartItemsFlatList}
                    keyExtractor={keyExtractor}
                    data={patientItems}
                    ItemSeparatorComponent={() => renderSeparator()}
                    renderItem={({ item, index }) => _renderCartItem(item, getPatient, index)}
                  />
                )}
              </>
            );
          })}
      </View>
    );
  };

  const renderEmptyCart = () => {
    return (
      <View style={{ marginTop: 20 }}>
        <Text style={styles.cartEmpty}>Your Cart is empty</Text>
      </View>
    );
  };

  const fetchPackageDetails = (
    itemIds: string | number[],
    func: (
      product: findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics
    ) => void | null,
    comingFrom: string
  ) => {
    const removeSpaces = typeof itemIds == 'string' ? itemIds.replace(/\s/g, '').split(',') : null;

    const listOfIds =
      typeof itemIds == 'string' ? removeSpaces?.map((item) => parseInt(item!)) : itemIds;

    const cityIdToPass =
      deliveryAddressId != ''
        ? Number(deliveryAddressCityId)
        : !!sourceScreen
        ? AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
        : Number(
            diagnosticServiceabilityData?.cityId! ||
              AppConfig.Configuration.DIAGNOSTIC_DEFAULT_CITYID
          );

    {
      setLoading?.(true);
      client
        .query<findDiagnosticsByItemIDsAndCityID, findDiagnosticsByItemIDsAndCityIDVariables>({
          query: GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
          context: {
            sourceHeaders,
          },
          variables: {
            //if address is not selected then from pincode bar otherwise from address
            cityID: cityIdToPass,
            itemIDs: listOfIds!,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          const product = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics');

          if (product) {
            func && func(product[0]!);

            if (comingFrom == 'diagnosticServiceablityChange') {
              product?.map((item) => {
                const diagnosticPricing = g(item, 'diagnosticPricing');
                const packageMrp = item?.packageCalculatedMrp!;
                const pricesForItem = getPricesForItem(diagnosticPricing, packageMrp);
                if (!pricesForItem?.itemActive) {
                  return null;
                }

                const specialPrice = pricesForItem?.specialPrice!;
                const price = pricesForItem?.price!;
                const circlePrice = pricesForItem?.circlePrice!;
                const circleSpecialPrice = pricesForItem?.circleSpecialPrice!;
                const discountPrice = pricesForItem?.discountPrice!;
                const discountSpecialPrice = pricesForItem?.discountSpecialPrice!;
                const planToConsider = pricesForItem?.planToConsider;

                updateCartItem?.({
                  id: item?.itemId?.toString() || product?.[0]?.id!,
                  name: item?.itemName,
                  price: price,
                  thumbnail: '',
                  specialPrice: specialPrice! || price,
                  circlePrice: circlePrice!,
                  circleSpecialPrice: circleSpecialPrice!,
                  discountPrice: discountPrice!,
                  discountSpecialPrice: discountSpecialPrice,
                  collectionMethod: item?.collectionType!,
                  groupPlan: planToConsider?.groupPlan,
                  packageMrp: packageMrp,
                  mou: item?.inclusions == null ? 1 : item?.inclusions?.length,
                  inclusions:
                    item?.inclusions == null
                      ? [Number(item?.itemId || product?.[0]?.id)]
                      : item?.inclusions,
                  isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
                });
                //put here...
                updatePatientCartItem?.({
                  id: item?.itemId?.toString() || product?.[0]?.id!,
                  name: item?.itemName!,
                  price: price,
                  thumbnail: '',
                  specialPrice: specialPrice! || price,
                  circlePrice: circlePrice!,
                  circleSpecialPrice: circleSpecialPrice!,
                  discountPrice: discountPrice!,
                  discountSpecialPrice: discountSpecialPrice,
                  collectionMethod: item?.collectionType!,
                  groupPlan: planToConsider?.groupPlan,
                  packageMrp: packageMrp,
                  mou: item?.inclusions == null ? 1 : item?.inclusions?.length,
                  inclusions:
                    item?.inclusions == null
                      ? [Number(item?.itemId || product?.[0]?.id)]
                      : item?.inclusions,
                  isSelected: AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
                });
              });
            }
          } else {
            errorAlert();
          }
          setLoading?.(false);
        })
        .catch((e) => {
          CommonBugFender('TestsCart_fetchPackageDetails', e);
          setLoading?.(false);
          errorAlert();
        });
    }
  };

  const _renderCartItem = (test: DiagnosticsCartItem, patientItems: any, index: number) => {
    const reportGenItem = reportGenDetails?.find((_item: any) => _item?.itemId === test?.id);
    return (
      <CartItemCard
        index={index}
        comingFrom={AppRoutes.CartPage}
        cartItem={test}
        selectedPatient={selectedPatient}
        isCircleSubscribed={isDiagnosticCircleSubscription}
        reportGenItem={reportGenItem}
        showCartInclusions={showInclusions}
        duplicateArray={duplicateNameArray}
        onPressCard={(item) => {
          CommonLogEvent(AppRoutes.CartPage, 'Navigate to test details scene');
          fetchPackageDetails(
            item?.id,
            (product) => {
              props.navigation.navigate(AppRoutes.TestDetails, {
                comingFrom: AppRoutes.TestsCart,
                testDetails: {
                  ItemID: item?.id,
                  ItemName: item?.name,
                  Rate: item?.price,
                  specialPrice: item?.specialPrice! || item?.price,
                  circleRate: item?.circlePrice,
                  circleSpecialPrice: item?.circleSpecialPrice,
                  discountPrice: item?.discountPrice,
                  discountSpecialPrice: item?.discountSpecialPrice,
                  FromAgeInDays: product?.fromAgeInDays!,
                  ToAgeInDays: product?.toAgeInDays!,
                  Gender: product?.gender,
                  collectionType: test?.collectionMethod,
                  preparation: product?.testPreparationData,
                  testDescription: product?.testDescription,
                  source: 'Cart page',
                  type: product?.itemType,
                  packageMrp: item?.itemPackageMrp,
                } as TestPackageForDetails,
              });
            },
            'onPress'
          );
        }}
        onPressRemove={(item) => {
          CommonLogEvent(AppRoutes.TestsCart, 'Remove item from cart');
          if (cartItems?.length == 0) {
            setDeliveryAddressId?.('');
          }
          onRemoveCartItem(item, patientItems?.id);
        }}
      />
    );
  };

  const renderMainView = () => {
    return (
      <View style={{ margin: 16 }}>
        {renderAddressSection()}
        {renderAddTestOption()}
        {!!isCartEmpty && !isCartEmpty ? renderEmptyCart() : renderCartItems()}
      </View>
    );
  };

  function _navigateToNextScreen() {
    isModifyFlow ? _navigateToReviewPage() : _navigateToAddressSelection();
  }

  function _navigateToAddressSelection() {
    props.navigation.navigate(AppRoutes.AddressSlotSelection, {
      reportGenDetails: reportGenDetails,
      selectedAddress: selectedAddr,
    });
  }

  //will be called in case of modify flow
  function _navigateToReviewPage() {
    props.navigation.navigate(AppRoutes.ReviewOrder, {
      reportGenDetails: reportGenDetails,
      selectedAddress: modifiedOrder?.patientAddressObj,
    });
  }

  //change this for modified orders
  function createItemPrice() {
    modifyPricesForItemArray =
      isModifyFlow &&
      modifiedOrder?.diagnosticOrderLineItems?.map(
        (item: orderListLineItems) =>
          ({
            itemId: Number(item?.itemId),
            price: item?.price,
            quantity: 1,
            groupPlan: item?.groupPlan,
          } as DiagnosticLineItem)
      );

    pricesForItemArray = cartItems?.map(
      (item, index) =>
        ({
          itemId: Number(item?.id),
          price:
            isDiagnosticCircleSubscription && item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.CIRCLE
              ? Number(item?.circleSpecialPrice)
              : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
              ? Number(item?.discountSpecialPrice)
              : Number(item?.specialPrice) || Number(item?.price),
          quantity: 1,
          groupPlan: isDiagnosticCircleSubscription
            ? item?.groupPlan!
            : item?.groupPlan == DIAGNOSTIC_GROUP_PLAN.SPECIAL_DISCOUNT
            ? item?.groupPlan
            : DIAGNOSTIC_GROUP_PLAN.ALL,
          preTestingRequirement:
            !!reportGenDetails && reportGenDetails?.[index]?.itemPrepration
              ? reportGenDetails?.[index]?.itemPrepration
              : null,
          reportGenerationTime:
            !!reportGenDetails && reportGenDetails?.[index]?.itemReportTat
              ? reportGenDetails?.[index]?.itemReportTat
              : null,
        } as DiagnosticLineItem)
    );
    const itemPricingObject = isModifyFlow
      ? [modifyPricesForItemArray, pricesForItemArray].flat(1)
      : pricesForItemArray;
    return {
      itemPricingObject,
      pricesForItemArray,
    };
  }
  //applying the first level duplicate checks. (check for normal + modify ) - single/multi
  function _checkInclusionLevelDuplicates() {
    console.log('tiotio');
    const arrayToSelect = isModifyFlow ? modifiedPatientCart : isCartEmpty;
    const filteredPatientItems = !!arrayToSelect && arrayToSelect;
    console.log({ filteredPatientItems });
    filteredPatientItems?.map((pItem, index) => {
      const allInclusions = pItem?.cartItems?.map((item) => item?.inclusions);
      const getPricesForItem = createItemPrice()?.itemPricingObject;
      const getCartItemPrices = createItemPrice()?.pricesForItemArray;
      const mergedInclusions = allInclusions?.flat(1); //from array level to single array
      const duplicateItems_1 = mergedInclusions?.filter(
        (e: any, i: any, a: any) => a.indexOf(e) !== i
      );

      const duplicateItems = [...new Set(duplicateItems_1)];
      console.log({ duplicateItems });
      hideAphAlert?.();
      setLoading?.(false);
      if (duplicateItems?.length) {
        checkDuplicateItems_Level1(
          getPricesForItem,
          duplicateItems,
          getCartItemPrices,
          pItem?.patientId,
          pItem?.cartItems,
          index,
          filteredPatientItems?.length
        );
      } else {
        if (index === isCartEmpty?.length - 1) {
          console.log('po');
          _navigateToNextScreen(); //move to next screen
        } else {
          index++;
        }
      }
    });
  }

  function checkDuplicateItems_Level1(
    getPricesForItem: any,
    duplicateItems: any,
    getCartItemPrices: any,
    patientId: string,
    cartItemsToCheck: DiagnosticsCartItem[],
    index: number,
    totalLength: number
  ) {
    //search for duplicate items in cart. (single tests added)
    let duplicateItemIds =
      !!cartItemsToCheck &&
      cartItemsToCheck?.filter((item) => duplicateItems?.includes(Number(item?.id)));

    let itemIdRemove = duplicateItemIds?.map((item) => Number(item?.id));

    //rest of the duplicate items which are not directly present in the cart
    const remainingDuplicateItems = duplicateItems?.filter(function(item: any) {
      return itemIdRemove?.indexOf(item) < 0;
    });

    //search for remaining duplicate items in cart's package inclusions
    let itemIdWithPackageInclusions = cartItems?.filter(({ inclusions }) =>
      inclusions?.some((num) => remainingDuplicateItems?.includes(num))
    );
    //get only itemId
    let packageInclusionItemId = itemIdWithPackageInclusions?.map((item) => Number(item?.id));

    //for the remaining packageItems, extract the prices
    let pricesForPackages = [] as any;

    getPricesForItem?.forEach((pricesItem: any) => {
      packageInclusionItemId?.forEach((packageId: number) => {
        if (Number(pricesItem?.itemId) == Number(packageId)) {
          pricesForPackages.push(pricesItem);
        }
      });
    });

    //sort with accordance with price
    let sortedPricesForPackage = pricesForPackages?.sort((a: any, b: any) => b?.price - a?.price);
    let remainingPackageDuplicateItems = sortedPricesForPackage?.slice(
      1,
      sortedPricesForPackage?.length
    );
    let remainingPackageDuplicateItemId = remainingPackageDuplicateItems?.map((item: any) =>
      Number(item?.itemId)
    );
    let finalRemovalId = [...itemIdRemove, remainingPackageDuplicateItemId]?.flat(1);

    setLoading?.(true);
    getDiagnosticsAvailability(
      Number(addressCityId),
      cartItemsToCheck,
      finalRemovalId,
      'proceedToPay'
    )
      .then(({ data }) => {
        const diagnosticItems = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
        const formattedDuplicateTest = diagnosticItems?.map((item) =>
          !!item?.itemName ? nameFormater(item?.itemName, 'default') : item?.itemName
        );
        const duplicateTests = formattedDuplicateTest?.join(', ');
        //remaining itemId's
        const updatedCartItems = cartItemsToCheck?.filter(function(items: any) {
          return finalRemovalId?.indexOf(Number(items?.id)) < 0;
        });

        //now on the updated cart item, find the duplicate items => higher price items
        const higherPricesItems = updatedCartItems?.filter(({ inclusions }) =>
          inclusions?.some((num) => finalRemovalId?.includes(num))
        );

        //if not found at inclusion level, then show whatever is coming from api.
        if (higherPricesItems?.length == 0) {
          setLoading?.(false);
          index == totalLength - 1 && _navigateToNextScreen();
        } else {
          //there can be case, that they are found in the inclusion level.
          const formattedHigherPriceItemName = higherPricesItems?.map(
            (item) => !!item?.name && nameFormater(item?.name, 'default')
          );
          const higherPricesName = formattedHigherPriceItemName?.join(', ');

          //clear cart
          onChangeCartItems(updatedCartItems, duplicateTests, finalRemovalId, patientId);

          //show inclusions
          let array = [] as any;
          updatedCartItems?.forEach((item) =>
            diagnosticItems?.forEach((dItem) => {
              if (item?.inclusions?.includes(Number(dItem?.itemId))) {
                array.push({
                  id: item?.id,
                  removalId: dItem?.itemId,
                  removalName: dItem?.itemName,
                });
              }
            })
          );

          setShowInclusions(true);
          let arrayToSet = [...duplicateNameArray, array].flat(1);
          setDuplicateNameArray(arrayToSet);
          setDuplicateItemsArray?.(arrayToSet);

          renderDuplicateMessage(duplicateTests, higherPricesName);
        }
      })
      .catch((e) => {
        //if api fails then also show the name... & remove..
        CommonBugFender('TestsCart_getDiagnosticsAvailability', e);
        setLoading?.(false);
        errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
      });
  }

  function onChangeCartItems(
    updatedCartItems: any,
    removedTest: string,
    removedTestItemId: any,
    patientId: string
  ) {
    const findIndex = patientCartItemsCopy?.findIndex(
      (item: DiagnosticPatientCartItem) => item?.patientId == patientId
    );
    patientCartItemsCopy[findIndex].cartItems = updatedCartItems;

    setDiagnosticSlot?.(null);
    setPatientCartItems?.(patientCartItemsCopy);
    setCartItems?.(updatedCartItems);
    isModifyFlow && setModifiedPatientCart?.(updatedCartItems);
    //refetch the areas
    if (deliveryAddressId != '') {
      const selectedAddressIndex = addresses?.findIndex(
        (address) => address?.id == deliveryAddressId
      );
      let removedItems = removedTestItemId?.join(', ');
      DiagnosticRemoveFromCartClicked(
        removedItems,
        removedTest,
        addresses?.[selectedAddressIndex]?.zipcode!,
        'Automated'
      );
    }
  }

  const renderDuplicateMessage = (duplicateTests: string, higherPricesName: string) => {
    showAphAlert?.({
      title: 'Your cart has been revised!',
      description: isModifyFlow
        ? `The "${duplicateTests}" has been removed from your cart as it is already included in your order. Kindly proceed to pay the revised amount`
        : `The "${duplicateTests}" has been removed from your cart as it is already included in another test "${higherPricesName}" in your cart. Kindly proceed to pay the revised amount`,
      onPressOk: () => {
        setLoading?.(false);
        hideAphAlert?.();
      },
    });
  };

  const disableCTA = isModifyFlow
    ? (!(!!addressText && isServiceable) && modifiedPatientCart?.length == 0) ||
      modifiedPatientCart?.[0]?.cartItems?.length == 0
    : !(!!addressText && isServiceable) ||
      patientCartItems?.length === 0 ||
      isCartEmpty?.length == 0;

  const renderStickyBottom = () => {
    return (
      <StickyBottomComponent>
        <Button
          title={isModifyFlow ? 'CHECKOUT' : 'SCHEDULE APPOINTMENT'}
          onPress={() => _checkInclusionLevelDuplicates()}
          disabled={disableCTA}
        />
      </StickyBottomComponent>
    );
  };

  const renderWizard = () => {
    return (
      <TimelineWizard
        currentPage={SCREEN_NAMES.CART}
        upcomingPages={[SCREEN_NAMES.SCHEDULE, SCREEN_NAMES.REVIEW]}
        donePages={[SCREEN_NAMES.PATIENT]}
        navigation={props.navigation}
        isModify={isModifyFlow}
      />
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderWizard()}
        <ScrollView bounces={false} style={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {renderMainView()}
        </ScrollView>
      </SafeAreaView>
      {renderStickyBottom()}
    </View>
  );
};

const styles = StyleSheet.create({
  addressOuterView: {
    backgroundColor: theme.colors.WHITE,
    marginTop: 10,
    paddingVertical: 10,
    marginBottom: 8,
    marginLeft: -16,
    marginRight: -16,
  },
  addressHeadingText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 20),
  },
  changeTextStyle: {
    ...theme.viewStyles.text('B', 13, theme.colors.APP_YELLOW, 1, 20),
  },
  addressTextStyle: {
    ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 18),
    width: '83%',
  },
  addressTextView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    marginRight: 16,
    marginBottom: 8,
  },
  addButtonStyle: {
    backgroundColor: theme.colors.WHITE,
    borderColor: theme.colors.APP_YELLOW,
    borderWidth: 1,
    elevation: 0,
    shadowColor: theme.colors.WHITE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    height: 50,
  },
  addButtonTitleStyle: {
    color: theme.colors.APP_YELLOW,
  },
  cartItemsFlatList: {
    ...theme.viewStyles.cardViewStyle,
    borderColor: 'rgba(2,71,91,0.2)',
    borderWidth: 1,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme.colors.WHITE,
    marginBottom: 10,
    marginTop: 10,
    elevation: 0,
  },
  patientNameText: {
    ...theme.viewStyles.text('SB', 12, theme.colors.WHITE, 1, 16),
  },
  patientNameView: {
    backgroundColor: theme.colors.SHERPA_BLUE,
    padding: 16,
    borderRadius: 10,
    margin: 16,
    marginBottom: -20,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    letterSpacing: 0.1,
    width: '94%',
    marginHorizontal: '2%',
  },
  iconStyle: {
    resizeMode: 'contain',
    height: 16,
    width: 16,
  },
  infoContainerStyle: {
    margin: -16,
    marginBottom: 8,
    backgroundColor: '#FFE9E4',
  },
  cartEmpty: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansBold(15),
    margin: 20,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
