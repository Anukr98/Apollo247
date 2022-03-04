import {
  AddPatientCircleIcon,
  Check,
  MinusPatientCircleIcon,
  PlusIconWhite,
  UnCheck,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import {
  formatAddressToLocation,
  g,
  isEmptyObject,
  nameFormater,
  checkPatientAge,
  isDiagnosticSelectedCartEmpty,
  distanceBwTwoLatLng,
  extractPatientDetails,
  isRtpcrInCart,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticPatientCartItem,
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import AsyncStorage from '@react-native-community/async-storage';
import {
  DiagnosticData,
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  diagnosticServiceability,
  fetchPatientAddressList,
  getDiagnosticSettings,
} from '@aph/mobile-patients/src/helpers/clientCalls';
import { useApolloClient } from 'react-apollo-hooks';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  EDIT_PROFILE,
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import {
  diagnosticsDisplayPrice,
  getPatientDetailsById,
  getPricesForItem,
} from '@aph/mobile-patients/src/components/Tests/utils/helpers';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';
import { AppConfig, BOTH_GENDER_ARRAY } from '@aph/mobile-patients/src/strings/AppConfig';
import { DiagnosticPatientSelected } from '@aph/mobile-patients/src/components/Tests/utils/Events';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import {
  GENDER,
  Gender,
  TEST_COLLECTION_TYPE,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { PatientDetailsOverlay } from '@aph/mobile-patients/src/components/Tests/components/PatientDetailsOverlay';
import {
  editProfile,
  editProfileVariables,
} from '@aph/mobile-patients/src/graphql/types/editProfile';
import moment from 'moment';
import { ExpressSlotMessageRibbon } from '@aph/mobile-patients/src/components/Tests/components/ExpressSlotMessageRibbon';
import { InfoMessage } from '@aph/mobile-patients/src/components/Tests/components/InfoMessage';

const screenHeight = Dimensions.get('window').height;
const { SHERPA_BLUE, WHITE, APP_GREEN, NEWGRAY } = theme.colors;

type Address = savePatientAddress_savePatientAddress_patientAddress;

export interface AddPatientsProps extends NavigationScreenProps {}

export const AddPatients: React.FC<AddPatientsProps> = (props) => {
  const { currentPatient, setCurrentPatientId, allCurrentPatients } = useAllCurrentPatients();
  const { getPatientApiCall } = useAuth();
  const {
    setCartItems,
    cartItems,
    isDiagnosticCircleSubscription,
    showSelectedPatient,
    patientCartItems,
    setDeliveryAddressId,
    deliveryAddressId,
    setDeliveryAddressCityId,
    addresses,
    setAddresses: setTestAddress,
    addPatientCartItem,
    removePatientCartItem,
    setPatientCartItems,
    removeMultiPatientCartItems,
    setPhleboETA,
    showMultiPatientMsg,
    setShowMultiPatientMsg,
    removePatientItem,
  } = useDiagnosticsCart();

  const { setAddresses } = useShoppingCart();
  const {
    diagnosticLocation,
    diagnosticServiceabilityData,
    setDiagnosticServiceabilityData,
    setDiagnosticLocation,
    setLocationDetails,
  } = useAppCommonData();

  const client = useApolloClient();

  var patientListToShow = allCurrentPatients?.filter(
    (item: any) => !!item?.id && item?.id != '+ADD MEMBER'
  );
  var isCartEmpty = isDiagnosticSelectedCartEmpty(patientCartItems);

  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [itemsSelected, setItemsSelected] = useState(patientCartItems);
  const [patientLimit, setPatientLimit] = useState<number>(0);
  const [limitMsg, setLimitMsg] = useState<string>('');
  const [patientSelectionCount, setPatientSelectionCount] = useState<number>(0);
  const [showPatientDetailsOverlay, setShowPatientDetailsOverlay] = useState<boolean>(false);
  const [tempPatientSelected, setTempPatientSelected] = useState({} as any);
  const [tempIndex, setTempIndex] = useState<number>(0);
  const [patientArray, setPatientArray] = useState([]) as any;
  const [genderSkuMsg, setGenderSkuMsg] = useState<string>('');

  const keyExtractor = useCallback((_, index: number) => `${index}`, []);
  const keyExtractor1 = useCallback((_, index: number) => `${index}`, []);
  const locationToSelect =
    !!diagnosticLocation && !isEmptyObject(diagnosticLocation)
      ? diagnosticLocation
      : AppConfig.Configuration.DIAGNOSTIC_DEFAULT_LOCATION;

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      setIsFocus(true);
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const didBlur = props.navigation.addListener('didBlur', (payload) => {
      setIsFocus(false);
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      didBlur && didBlur.remove();
    };
  }, []);

  useEffect(() => {
    if (isFocus && cartItems?.length > 0) {
      const getExisitngItems = patientCartItems
        ?.map((item) => item?.cartItems?.filter((idd) => idd?.id))
        ?.flat();
      let existingId = getExisitngItems?.map((items: DiagnosticsCartItem) => items?.id);
      let getNewItems = cartItems?.filter((cItems) => !existingId?.includes(cItems?.id));
      //added since, zero price + updated price item was getting added
      const isPriceNotZeroArray = getNewItems?.filter((item) => item?.price != 0);

      const newCartItems = patientCartItems?.map((item) => {
        const patientDetails = getPatientDetailsById(allCurrentPatients, item?.patientId);

        const newCartItemsWithSkuSelections = isPriceNotZeroArray?.map((obj) =>
          !BOTH_GENDER_ARRAY.includes(obj?.gender!?.toLowerCase()) &&
          !BOTH_GENDER_ARRAY.includes(patientDetails?.gender?.toLowerCase()) &&
          obj?.gender?.toLowerCase() != patientDetails?.gender?.toLowerCase()
            ? { ...obj, isSelected: false }
            : { ...obj, isSelected: true }
        );

        let obj = {
          patientId: item?.patientId,
          cartItems: item?.cartItems?.concat(newCartItemsWithSkuSelections)?.flat(),
        };
        return obj;
      });
      setPatientCartItems?.(newCartItems);
    }
    //if cartitems is zero, then remove all selected patients
    else if (isFocus && cartItems?.length == 0) {
      removeMultiPatientCartItems?.();
    }
  }, [cartItems, isFocus]);

  useEffect(() => {
    addresses?.length == 0 && fetchAddress();
    fetchFindDiagnosticSettings();
    if (showMultiPatientMsg) {
      renderMultiPatientAlert();
    }
  }, []);

  /**
   * for showing the alert msg if patient selected exceeds the limit
   */
  useEffect(() => {
    const actualSelectedPatients = isDiagnosticSelectedCartEmpty(patientCartItems);
    !!actualSelectedPatients && setPatientSelectionCount(actualSelectedPatients?.length);
    if (patientLimit > 0 && actualSelectedPatients?.length > patientLimit) {
      renderAlert();
      patientCartItems?.shift();
      setPatientCartItems?.(patientCartItems?.slice(0)); //since it was not re-rendering
    }
  }, [patientCartItems]);

  /**
   * for filtering out the patients if cartItems has only items (that are specific to only one gender) + patientCartItem is empty
   *
   */
  useEffect(() => {
    if (cartItems?.length > 0) {
      const { hasAllSku, filterFemaleSku, filterMaleSku } = getSkuItemsGender(cartItems);
      if (!!hasAllSku) {
        setGenderSkuMsg('');
        return;
      } else if (filterFemaleSku?.length > 0 && filterMaleSku?.length == 0) {
        setGenderSkuMsg(string.diagnostics.skuGenderGeneralMsg.replace('{{gender}}', 'female'));
      } else if (filterFemaleSku?.length == 0 && filterMaleSku?.length > 0) {
        setGenderSkuMsg(string.diagnostics.skuGenderGeneralMsg.replace('{{gender}}', 'male'));
      }
    }
  }, [cartItems, patientCartItems]);

  /**
   * for fetching the prices based on the address selected on homepage
   */
  useEffect(() => {
    if (
      (!!diagnosticServiceabilityData &&
        !isEmptyObject(diagnosticServiceabilityData) &&
        cartItems?.length > 0) ||
      cartItems?.length > 0
    ) {
      getAddressServiceability();
    }
  }, []);

  function getSkuItemsGender(arrayToSearch: DiagnosticsCartItem[]) {
    const filterHasAllSku = arrayToSearch?.filter(
      (cItem) => cItem?.gender == GENDER.ALL || cItem?.gender == GENDER.OTHER
    );
    const filterMaleSku = filterGenderSKU(arrayToSearch, GENDER.MALE);
    const filterFemaleSku = filterGenderSKU(arrayToSearch, GENDER.FEMALE);
    const hasAllSku = arrayToSearch?.find(
      (cItem) => cItem?.gender == GENDER.ALL || cItem?.gender == GENDER.OTHER
    );

    const hasAllFemaleSku =
      !!!hasAllSku && filterFemaleSku?.length > 0 && filterMaleSku?.length == 0;
    const hasAllMaleSku = !!!hasAllSku && filterMaleSku?.length > 0 && filterFemaleSku?.length == 0;
    return {
      filterFemaleSku,
      filterMaleSku,
      filterHasAllSku,
      hasAllSku,
      hasAllFemaleSku,
      hasAllMaleSku,
    };
  }

  function filterGenderSKU(arr: DiagnosticsCartItem[], gender: GENDER) {
    return arr?.filter((item) => item?.gender === gender);
  }

  function handleBack() {
    props.navigation.goBack();
    return true;
  }

  const fetchFindDiagnosticSettings = async () => {
    try {
      const response = await getDiagnosticSettings(client, 0);
      if (!response?.errors && response?.data?.findDiagnosticSettings) {
        const getResponse = response?.data?.findDiagnosticSettings;
        const phleboMin =
          (!!getResponse && getResponse?.phleboETAInMinutes) ||
          AppConfig.Configuration.DEFAULT_PHELBO_ETA;
        const maxPatient =
          (!!getResponse && getResponse?.maxAllowedUhidsCount) ||
          AppConfig.Configuration.MAX_PATIENT_SELECTION;
        const patientLimitMsg =
          (!!getResponse && getResponse?.maxUhidsLimitExceededMessage) ||
          string.diagnosticsCartPage.patientSelectionLimit?.replace(
            '{{count}}',
            String(AppConfig.Configuration.MAX_PATIENT_SELECTION)
          );
        setPatientLimit(maxPatient);
        setPhleboETA?.(phleboMin);
        setLimitMsg(patientLimitMsg);
      } else {
        setPatientLimit(AppConfig.Configuration.MAX_PATIENT_SELECTION);
        setPhleboETA?.(AppConfig.Configuration.DEFAULT_PHELBO_ETA);
        setLimitMsg(
          string.diagnosticsCartPage.patientSelectionLimit?.replace(
            '{{count}}',
            String(AppConfig.Configuration.MAX_PATIENT_SELECTION)
          )
        );
      }
    } catch (error) {
      CommonBugFender('ReviewOrder_fetchFindDiagnosticSettings', error);
    }
  };

  function saveDiagnosticLocation(locationDetails: LocationData) {
    setDiagnosticLocation?.(locationDetails);
    setLocationDetails?.(locationDetails);
  }

  async function fetchAddress() {
    try {
      setLoading?.(true);
      const response = await fetchPatientAddressList(client, currentPatient?.id);
      const addressList = (response?.data?.getPatientAddressList?.addressList as Address[]) || [];
      setAddresses?.(addressList);
      setTestAddress?.(addressList);

      //set the default address
      const deliveryAddress = addressList?.find((item) => item?.defaultAddress);
      if (deliveryAddress) {
        if (!diagnosticLocation) {
          saveDiagnosticLocation?.(formatAddressToLocation(deliveryAddress));
        }
      }
      setLoading?.(false);
    } catch (error) {
      // -> load default hyderabad.
      setLoading?.(false);
      CommonBugFender('AddPatients_fetchAddress', error);
    }
  }

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

  function _onPresssMultiPatientMsgCTA() {
    hideAphAlert?.();
    setShowMultiPatientMsg?.(false);
  }

  const renderMultiPatientAlert = () => {
    showAphAlert?.({
      removeTopIcon: true,
      onPressOutside: () => {
        _onPresssMultiPatientMsgCTA();
      },
      children: (
        <View style={{ padding: 16 }}>
          <Text style={styles.multiPatientText}>{string.diagnosticsCartPage.multiPatientMsg}</Text>
          <Image
            source={require('@aph/mobile-patients/src/components/ui/icons/multiTestImage.webp')}
          />
          <View style={styles.multiPatientCTAView}>
            <Button title={'OK, GOT IT'} onPress={() => _onPresssMultiPatientMsgCTA()} />
          </View>
        </View>
      ),
    });
  };

  const renderAlert = () => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: limitMsg,
    });
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

  const updatePricesInCart = (results: any) => {
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
            const updatedItems = {
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
              mou: 1,
              thumbnail: cartItem?.thumbnail,
              groupPlan: planToConsider?.groupPlan,
              packageMrp: results?.[isItemInCart]?.packageCalculatedMrp,
              inclusions:
                results?.[isItemInCart]?.inclusions == null
                  ? [Number(results?.[isItemInCart]?.itemId)]
                  : results?.[isItemInCart]?.inclusions,
              isSelected:
                cartItem?.isSelected || AppConfig.Configuration.DEFAULT_ITEM_SELECTION_FLAG,
              collectionMethod: TEST_COLLECTION_TYPE.HC,
            };
            updateCartItemsLocally(updatedItems);
            setLoading?.(false);
          }
        }
        //if items not available
        if (disabledCartItems?.length) {
          isItemDisable = true;
          const disabledCartItemIds = disabledCartItems?.map((item) => item.id);
          setLoading?.(false);
          removeDisabledCartItems(disabledCartItemIds);
          removeDisabledPatientCartItems(disabledCartItemIds);
        }
      });
      if (!isItemDisable && !isPriceChange) {
        isPriceChange = false;
        isItemDisable = false;
        setLoading?.(false);
      }
    }
  };

  function updateCartItemsLocally(updatedItems: DiagnosticsCartItem) {
    const newPatientCartItem = patientCartItems?.map((patientItems: DiagnosticPatientCartItem) => {
      const findLineItemsIndex = patientItems?.cartItems?.findIndex(
        (lineItems: DiagnosticsCartItem) => lineItems?.id === updatedItems?.id
      );
      if (findLineItemsIndex !== -1) {
        patientItems.cartItems[findLineItemsIndex] = updatedItems;
        const patientLineItemObj: DiagnosticPatientCartItem = {
          patientId: patientItems?.patientId,
          cartItems: patientItems?.cartItems,
        };
        return patientLineItemObj;
      } else {
        return patientItems;
      }
    });
    setPatientCartItems?.([...newPatientCartItem!].slice(0));
    const foundIndex = cartItems?.findIndex((item) => item?.id == updatedItems?.id);
    if (foundIndex !== -1) {
      cartItems[foundIndex] = { ...cartItems[foundIndex], ...updatedItems };
      setCartItems?.([...cartItems]?.slice(0));
    }
  }

  async function getAddressServiceability() {
    //whatever is there on homepage -> in diagnosticLocation
    let obj = {} as DiagnosticData;
    setLoading?.(true);
    try {
      const serviceabilityResponse = await diagnosticServiceability(
        client,
        Number(locationToSelect?.latitude),
        Number(locationToSelect?.longitude)
      );
      if (
        !serviceabilityResponse?.errors &&
        serviceabilityResponse?.data?.getDiagnosticServiceability &&
        serviceabilityResponse?.data?.getDiagnosticServiceability?.status
      ) {
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
          fetchPricesForItems(getServiceableResponse);
        } else {
          //non-serviceable
          setNonServicebleData();
        }
      } else {
        setNonServicebleData();
      }
    } catch (error) {
      CommonBugFender('AddPatients_getAddressServiceability', error);
      setLoading?.(false);
      setDeliveryAddressCityId?.('');
      setDeliveryAddressId?.('');
    }
  }

  function setNonServicebleData() {
    // setLoading?.(false);
    let obj = {
      cityID: 9,
      stateID: 1,
      state: 'Telangana',
      city: 'Hyderabad',
    };
    //if non - serviceable then fetch from the hyderabad city
    fetchPricesForItems(obj);
  }

  const fetchPricesForItems = (getServiceableResponse: any) => {
    getDiagnosticsAvailability(Number(getServiceableResponse?.cityID!), cartItems)
      .then(({ data }) => {
        const diagnosticItems = g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
        updatePricesInCart(diagnosticItems);
        cartItems?.length == 0 && setLoading?.(false);
      })
      .catch((e) => {
        console.log({ e });
        CommonBugFender('AddPatients_getAddressServiceability_getDiagnosticsAvailability', e);
        setLoading?.(false);
        errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
      });
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'ADD PATIENTS'}
        onPressLeftIcon={() => handleBack()}
      />
    );
  };

  const changeCurrentProfile = (_selectedPatient: any, _showPatientDetailsOverlay: boolean) => {
    if (currentPatient?.id === _selectedPatient?.id) {
      return;
    } else if (!_selectedPatient?.dateOfBirth || !_selectedPatient?.gender) {
      showSelectedPatient?.(_selectedPatient);
      return;
    }
    setCurrentPatientId?.(_selectedPatient?.id);
    AsyncStorage.setItem('selectUserId', _selectedPatient?.id);
    AsyncStorage.setItem('selectUserUHId', _selectedPatient?.uhid || '');
  };

  const onNewProfileAdded = (newPatient: any) => {
    if (newPatient?.profileData) {
      if (!checkPatientAge(newPatient?.profileData, true)) {
        addPatientCartItem?.(newPatient?.id, cartItems);
        changeCurrentProfile(newPatient?.profileData, false);
      } else {
        renderBelowAgePopUp();
      }
    }
  };

  function _onPressBack() {}

  function _onPressAddPatients() {
    //navigate to add a member screen
    props.navigation.navigate(AppRoutes.EditProfile, {
      isEdit: false,
      isPoptype: true,
      mobileNumber: currentPatient?.mobileNumber,
      onNewProfileAdded: onNewProfileAdded,
      onPressBackButton: _onPressBack(),
    });
  }

  const renderBelowAgePopUp = () => {
    showAphAlert?.({
      title: string.common.uhOh,
      description: string.diagnostics.minorAgeText,
      onPressOk: () => {
        hideAphAlert?.();
      },
    });
  };

  const renderHeading = () => {
    return (
      <View style={[styles.rowStyle, styles.headingContainer]}>
        <Text style={styles.patientHeadingText}>
          {nameFormater(string.diagnosticsCartPage.patientHeading, 'title')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={() => _onPressAddPatients()}
          style={{ width: 120 }}
        >
          <View style={[styles.flexRow, { justifyContent: 'flex-end' }]}>
            <PlusIconWhite style={styles.addIconStyle} />
            <Text style={styles.addMemberText}>
              {nameFormater(string.diagnosticsCartPage.addPatient, 'upper')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSubHeading = () => {
    return (
      <View style={{ marginTop: 5 }}>
        <Text style={styles.subHeadingText}>
          {string.diagnosticsCartPage.subHeadingMultipleUHID?.replace(
            '{{patientCount}}',
            `${patientLimit}`
          )}
        </Text>
      </View>
    );
  };

  function _onPressSelectTest(selectedTest: any, ind: number, selectedPatientDetails: any) {
    const selectedPatientIndex = patientCartItems?.findIndex(
      (item) => item?.patientId == selectedPatientDetails?.patientId
    );

    const getPatientDetailsCopy = JSON.parse(JSON.stringify(patientCartItems)); //created a deep copy

    const arr = getPatientDetailsCopy?.[selectedPatientIndex]?.cartItems?.map(
      (newItem: any, index: number) => {
        if (ind == index) {
          newItem.isSelected = !newItem?.isSelected;
        }
        return { ...newItem };
      }
    );
    //this would be for one of the patient
    const isAllUnSelected = !!arr && arr?.filter?.((test: any) => test?.isSelected);
    if (!!isAllUnSelected && isAllUnSelected?.length == 0) {
      //remove that patient...
      removePatientItem?.(selectedPatientDetails?.patientId);
    } else {
      addPatientCartItem?.(selectedPatientDetails?.patientId, arr!); //just change the flag here.
    }
    setItemsSelected(arr!);
  }

  function checkEmptyPatientValues(patient: any, index: any) {
    if (!patient?.dateOfBirth || !patient?.gender) {
      return true;
    } else {
      return false;
    }
  }

  function _onPressPatient(patient: any, index: number) {
    const isInvalidUser = checkPatientAge(patient);
    const hasEmptyValues = checkEmptyPatientValues(patient, index);
    const hasRtpcrInCart = isRtpcrInCart(cartItems);
    if (isInvalidUser && !!!hasRtpcrInCart) {
      renderBelowAgePopUp();
    } else if (hasEmptyValues) {
      setShowPatientDetailsOverlay(true);
      setTempPatientSelected(patient);
      setTempIndex(index);
    } else {
      _setSelectedPatient?.(patient, index);
    }
  }

  function _setSelectedPatient(patientDetails: any, ind: number) {
    const isPresent = !!patientCartItems
      ? patientCartItems?.find((cart) => cart?.patientId == patientDetails?.id)
      : patientArray?.find((item: string) => patientDetails?.id == item);
    if (!!isPresent) {
      const restOfArray = patientArray?.filter((item: string) => item != patientDetails?.id);
      setPatientArray(restOfArray);
      updatePatientItem(patientDetails, false);
    } else {
      const updatedArray = patientArray?.concat(patientDetails?.id);
      setPatientArray(updatedArray);
      updatePatientItem(patientDetails, true);
    }
  }

  function updatePatientItem(selectedPatient: any, selectedValue: boolean) {
    const filterEligibleSku = cartItems?.filter(
      (cartItem: DiagnosticsCartItem) =>
        cartItem?.gender?.toLowerCase() == selectedPatient?.gender?.toLowerCase() ||
        BOTH_GENDER_ARRAY.includes(cartItem?.gender!?.toLowerCase()) ||
        BOTH_GENDER_ARRAY.includes(selectedPatient?.gender?.toLowerCase())
    );

    const filterInEligibleSku = cartItems?.filter(
      (cartItem: DiagnosticsCartItem) =>
        cartItem?.gender?.toLowerCase() != selectedPatient?.gender?.toLowerCase() &&
        !BOTH_GENDER_ARRAY.includes(cartItem?.gender!?.toLowerCase()) &&
        !BOTH_GENDER_ARRAY.includes(selectedPatient?.gender!?.toLowerCase())
    );

    const updatedItems = JSON.parse(JSON.stringify(cartItems));
    if (selectedValue) {
      updatedItems?.map((item: any) => {
        const isSkuIneligible = filterInEligibleSku?.find((sku) => sku?.id == item?.id);
        item['isSelected'] = !!isSkuIneligible ? false : selectedValue;
      });
      addPatientCartItem?.(selectedPatient?.id, updatedItems);
    } else {
      removePatientCartItem?.(selectedPatient?.id);
    }
  }

  function _updatePatientDetails(_selectedPatient: any, _gender: Gender, _date: any) {
    setShowPatientDetailsOverlay(false);
    setLoading?.(true);
    client
      .mutate<editProfile, editProfileVariables>({
        mutation: EDIT_PROFILE,
        variables: {
          editProfileInput: {
            id: _selectedPatient?.id,
            photoUrl: _selectedPatient?.photoUrl,
            firstName: _selectedPatient?.firstName?.trim(),
            lastName: _selectedPatient?.lastName?.trim(),
            relation: _selectedPatient?.relation,
            gender: _gender,
            dateOfBirth: moment(_date, 'DD/MM/YYYY')?.format('YYYY-MM-DD'),
            emailAddress: _selectedPatient?.emailAddress?.trim(),
          },
        },
      })
      .then(({ data }) => {
        const profileData = data?.editProfile?.patient;
        setLoading?.(false);
        getPatientApiCall();
        if (!checkPatientAge(profileData, true)) {
          showSelectedPatient?.(profileData!);
          changeCurrentProfile(profileData, false);
          _setSelectedPatient(profileData, tempIndex);
        } else {
          renderBelowAgePopUp();
          _setSelectedPatient?.(null, 0);
        }
      })
      .catch((e) => {
        setLoading?.(false);
        showAphAlert?.({
          title: string.common.uhOh,
          description: string.common.tryAgainLater,
        });
        CommonBugFender('AddPatients_updateUserProfile', e);
      });
  }

  const renderPatientDetailsOverlay = () => {
    return showPatientDetailsOverlay ? (
      <PatientDetailsOverlay
        selectedPatient={tempPatientSelected}
        onPressClose={() => setShowPatientDetailsOverlay(false)}
        onPressDone={(_date, _gender, _selectedPatient) => {
          _updatePatientDetails(_selectedPatient, _gender, _date);
        }}
      />
    ) : null;
  };

  const renderFooterComponent = () => {
    return <View style={{ height: 40 }} />;
  };

  const renderSeparator = () => {
    return <Spearator />;
  };

  function checkSkuPatientGender(test: any, patientDetails: any) {
    return (
      BOTH_GENDER_ARRAY?.includes(test?.gender?.toLowerCase()) ||
      test?.gender?.toLowerCase() == patientDetails?.gender?.toLowerCase() ||
      BOTH_GENDER_ARRAY?.includes(patientDetails?.gender?.toLowerCase())
    );
  }

  const renderCartItemList = (
    test: any,
    index: number,
    selectedPatientDetails: DiagnosticPatientCartItem
  ) => {
    const patientDetails = getPatientDetailsById(
      allCurrentPatients,
      selectedPatientDetails?.patientId
    );
    const itemName = test?.name;
    const priceToShow = diagnosticsDisplayPrice(test, isDiagnosticCircleSubscription)?.priceToShow;
    const skuPatientGender = checkSkuPatientGender(test, patientDetails);
    const skuType = test?.inclusions?.length > 1 ? 'package' : 'test';
    const skuMsg = string.diagnostics.skuGenderMessage
      .replace('{{skuType}}', !!skuType ? skuType : 'test')
      .replace('{{gender}}', test?.gender?.toLowerCase());
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() =>
          skuPatientGender ? _onPressSelectTest(test, index, selectedPatientDetails) : null
        }
        style={[
          styles.patientSelectTouch,
          {
            backgroundColor:
              !!test?.isSelected && test?.isSelected
                ? colors.GREEN_BACKGROUND
                : !skuPatientGender
                ? colors.GREEN_BACKGROUND
                : colors.WHITE,
          },
        ]}
      >
        <View style={{ width: '70%' }}>
          <Text numberOfLines={1} style={styles.itemNameText}>
            {nameFormater(itemName, 'default')}
          </Text>
          {!test?.isSelected && !skuPatientGender
            ? renderGenderSkuMsg('individalSku', skuMsg)
            : null}
        </View>
        <View style={{ flexDirection: 'row' }}>
          <Text style={[styles.itemNameText, { marginRight: 8 }]}>
            {string.common.Rs}
            {priceToShow}
          </Text>
          {!!test?.isSelected && test?.isSelected ? (
            <Check style={styles.checkBoxIcon} />
          ) : (
            <UnCheck style={styles.checkBoxIcon} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCartItems = (patientDetails: any) => {
    const findPatientCartMapping =
      !!patientCartItems &&
      patientCartItems?.find((item) => item?.patientId === patientDetails?.id);

    return (
      <View>
        {!!findPatientCartMapping ? (
          <View style={styles.cartItemsFlatList}>
            <FlatList
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyExtractor={keyExtractor}
              data={findPatientCartMapping?.cartItems || []}
              renderItem={({ item, index }) =>
                renderCartItemList(item, index, findPatientCartMapping)
              }
              contentContainerStyle={styles.cartItemsFlatList}
              ItemSeparatorComponent={renderSeparator}
            />
          </View>
        ) : null}
      </View>
    );
  };

  const renderPatientListItem = (item: any, index: number) => {
    const { patientName, genderAgeText, patientSalutation } = extractPatientDetails(item);
    const { hasAllFemaleSku, hasAllMaleSku } = getSkuItemsGender(cartItems);
    const isPresent =
      !!patientCartItems && patientCartItems?.find((cart) => cart?.patientId == item?.id);
    const patientSelectedItems =
      isPresent && isPresent?.cartItems?.filter((item) => item?.isSelected);

    const showGreenBg = !!patientSelectedItems && patientSelectedItems?.length > 0;
    const isMinorAge = checkPatientAge(item);
    const disablePatientForSkuGender =
      ((item?.gender === GENDER.MALE || BOTH_GENDER_ARRAY.includes(item?.gender)) &&
        hasAllFemaleSku) ||
      ((item?.gender === GENDER.FEMALE || BOTH_GENDER_ARRAY.includes(item?.gender)) &&
        hasAllMaleSku);

    const itemViewStyle = [
      styles.patientItemViewStyle,
      index === 0 && { marginTop: 12 },
      isMinorAge && { backgroundColor: 'rgb(252,252,251)' },
      disablePatientForSkuGender && { backgroundColor: colors.LIGHT_GRAY_3 },
      showGreenBg && { backgroundColor: APP_GREEN },
    ];

    const minorAgeTextOpacity = isMinorAge && { opacity: 0.6 };
    const disabledPatientTextOpacity = disablePatientForSkuGender && { opacity: 0.4 };
    return (
      <View
        style={[
          styles.itemStyleView,
          {
            marginBottom: index === patientListToShow?.length - 1 ? 16 : 0,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.5}
          style={itemViewStyle}
          onPress={() => (disablePatientForSkuGender ? {} : _onPressPatient(item, index))}
        >
          <View
            style={[
              { flexDirection: 'row' },
              isMinorAge
                ? { marginLeft: -20, marginRight: -16 }
                : { marginLeft: -8, marginRight: -4 },
            ]}
          >
            <Text
              style={[
                styles.patientNameTextStyle,
                minorAgeTextOpacity,
                disabledPatientTextOpacity,
                showGreenBg && { color: WHITE },
              ]}
            >
              {patientSalutation} {patientName}
            </Text>
            <Text
              style={[
                styles.genderAgeTextStyle,
                minorAgeTextOpacity,
                disabledPatientTextOpacity,
                showGreenBg && { color: WHITE },
              ]}
            >
              {genderAgeText}
            </Text>
            <View style={styles.arrowIconView}>
              {!showGreenBg ? (
                <MinusPatientCircleIcon style={[styles.arrowStyle]} />
              ) : (
                <AddPatientCircleIcon style={[styles.arrowStyle]} />
              )}
            </View>
          </View>
          {isMinorAge ? renderMinorPatientText() : null}
        </TouchableOpacity>
        {renderCartItems(item)}
      </View>
    );
  };

  const renderMinorPatientText = () => {
    return (
      <View style={styles.minorAgeTextView}>
        <Text style={styles.minorAgeText}>{string.diagnosticsCartPage.minorAgeTestText}</Text>
      </View>
    );
  };

  const renderPatientsList = () => {
    return (
      <View style={styles.patientListView}>
        <View style={styles.mainViewStyle}>
          <FlatList
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ marginBottom: 20 }}
            keyExtractor={keyExtractor1}
            data={patientListToShow || []}
            renderItem={({ item, index }) => renderPatientListItem(item, index)}
            ListFooterComponent={renderFooterComponent}
          />
        </View>
      </View>
    );
  };

  function _navigateToCartPage() {
    triggerWebengageEvent();
    props.navigation.navigate(AppRoutes.CartPage);
  }

  function _navigateToAddressPage() {
    props.navigation.navigate(AppRoutes.AddAddressNew, {
      addOnly: true,
      source: 'Diagnostics Cart' as AddressSource,
      ComingFrom: AppRoutes.AddPatients,
    });
  }

  function _checkAddresses() {
    /**
   * find the address (if i have the saved addresses)
   1. if deliveryAddressId is there -> selected from the saved address (manual selection)
   2. if deliveryAddressId is not there -> 
   2.1. current location or search address (manual changed) 
        => search the address, with the pincode 
        => multiple results then closest pincode 
        => set that address  in the delivery id
    2.2. current location or search address or previous address without manual intervntion
        => search the address , with the pincode
        => no results are there, then take the user to the add address screen, with lat lng from the previous i.e homepage
   3. If no address is there, then take user directly to enter the new address (with the lat-lng from the homepage)
   4. check for the delivery address id
  **/
    if (addresses?.length == 0) {
      _navigateToAddressPage();
    } else {
      if (deliveryAddressId != '') {
        _navigateToCartPage();
      } else {
        const getHomePagePincode = locationToSelect?.pincode;
        const getHomePageLat = locationToSelect?.latitude;
        const getHomePageLong = locationToSelect?.longitude;
        if (!!getHomePagePincode) {
          const getNearByAddresses = addresses?.filter(
            (item) => Number(item?.zipcode) === Number(getHomePagePincode)
          );
          const getSameCityAddresses = addresses?.filter(
            (item) => item?.city?.toLowerCase() == locationToSelect?.city?.toLowerCase()
          );
          if (getNearByAddresses?.length > 0 && getNearByAddresses?.length > 1) {
            _getAddressWithLatLng(getHomePageLat!, getHomePageLong!, getNearByAddresses);
          } else if (getNearByAddresses?.length == 1) {
            setDeliveryAddressId?.(getNearByAddresses?.[0]?.id);
            _navigateToCartPage();
          } else if (getSameCityAddresses?.length > 0 && getSameCityAddresses?.length > 1) {
            _getAddressWithLatLng(getHomePageLat!, getHomePageLong!, getSameCityAddresses);
          } else if (getSameCityAddresses?.length == 1) {
            setDeliveryAddressId?.(getSameCityAddresses?.[0]?.id);
            _navigateToCartPage();
          } else {
            _navigateToAddressPage();
          }
        } else {
          _navigateToAddressPage();
        }
      }
    }
  }

  function _getAddressWithLatLng(lat: number, lng: number, filteredAddresses?: Address[]) {
    const findFromAddress = !!filteredAddresses ? filteredAddresses : addresses;
    const diffArray = findFromAddress?.map((item) =>
      distanceBwTwoLatLng(lat, lng, item?.latitude!, item?.longitude!)
    );

    const indexOfMinDistance = diffArray?.indexOf(Math.min.apply(null, diffArray));
    const nearestAddress = findFromAddress?.[indexOfMinDistance];
    !!nearestAddress && setDeliveryAddressId?.(nearestAddress?.id);
    _navigateToCartPage();
  }

  function triggerWebengageEvent() {
    const selectedPatientCount = patientCartItems?.length;
    const selectedPatientId = patientCartItems?.map(
      (items: DiagnosticPatientCartItem) => items?.patientId
    );
    const filterSelectedPatients = patientListToShow?.filter((item: any) =>
      selectedPatientId?.includes(item?.id)
    );
    const patientName =
      !!filterSelectedPatients &&
      filterSelectedPatients
        ?.map((item: any) => `${item?.firstName} ${item?.lastName}`)
        ?.join(', ');

    const patientUHID =
      !!filterSelectedPatients &&
      filterSelectedPatients?.map((item: any) => item?.uhid)?.join(', ');

    DiagnosticPatientSelected(selectedPatientCount, patientUHID, patientName);
  }
  const CTAdisabled = !(
    !!patientCartItems &&
    patientCartItems?.length > 0 &&
    isCartEmpty?.length > 0
  );

  const renderStickyBottom = () => {
    return (
      <StickyBottomComponent style={styles.stickyBottomStyle}>
        {renderSelectedPatientCount()}
        <Button
          title={'CONTINUE'}
          onPress={() => _checkAddresses()}
          disabled={CTAdisabled}
          style={{ width: '70%' }}
        />
      </StickyBottomComponent>
    );
  };

  const renderSelectedPatientCount = () => {
    return (
      <View style={styles.patientSelectionCountView}>
        <Text style={styles.selectedPatientCount}>
          {patientSelectionCount < 10 ? `0${patientSelectionCount}` : `${patientSelectionCount}`}
        </Text>
        <Text style={styles.selectedPatientCountText}>Patients</Text>
      </View>
    );
  };

  const renderGenderSkuMsg = (source: string, msg?: string) => {
    return (
      <InfoMessage
        content={source == 'overall' ? genderSkuMsg : msg!}
        textStyle={[styles.subHeadingText]}
        iconStyle={[styles.infoIconStyle]}
        containerStyle={[styles.genderSkuMsgView, source == 'overall' && { alignItems: 'center' }]}
        isCard={false}
      />
    );
  };

  const renderMainView = () => {
    return (
      <View style={styles.mainContainerView}>
        {renderHeading()}
        {renderSubHeading()}
        {genderSkuMsg != '' ? renderGenderSkuMsg('overall') : null}
        {renderPatientsList()}
      </View>
    );
  };

  const renderWizard = () => {
    return (
      <TimelineWizard
        currentPage={SCREEN_NAMES.PATIENT}
        upcomingPages={[SCREEN_NAMES.CART, SCREEN_NAMES.SCHEDULE, SCREEN_NAMES.REVIEW]}
        donePages={[]}
        navigation={props.navigation}
      />
    );
  };
  const renderExpressSlots = () => {
    return diagnosticServiceabilityData && diagnosticLocation ? (
      <ExpressSlotMessageRibbon
        serviceabilityObject={diagnosticServiceabilityData}
        selectedAddress={diagnosticLocation}
      />
    ) : null;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderWizard()}
        {renderExpressSlots()}
        {renderMainView()}
        {renderPatientDetailsOverlay()}
      </SafeAreaView>
      {renderStickyBottom()}
    </View>
  );
};

const { text, cardViewStyle } = theme.viewStyles;
const styles = StyleSheet.create({
  rowStyle: { flexDirection: 'row', justifyContent: 'space-between' },
  flexRow: { flexDirection: 'row' },
  patientHeadingText: { ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 22) },
  addMemberText: { ...theme.viewStyles.text('SB', 14, theme.colors.APP_YELLOW, 1, 22) },
  addIconStyle: {
    marginTop: 2,
    marginRight: 4,
    tintColor: theme.colors.APP_YELLOW,
    height: 15,
    width: 10,
    resizeMode: 'contain',
  },
  headingContainer: { alignItems: 'center' },
  subHeadingText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 18),
  },
  patientListView: {
    flex: 1,
    flexGrow: 1,
    marginBottom: 20, //16
  },
  mainViewStyle: {
    flexGrow: 1,
    flex: 1,
    padding: 5,
  },
  patientItemViewStyle: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...cardViewStyle,
    padding: 12,
    marginTop: 16,
    minHeight: 45,
    borderColor: NEWGRAY,
    borderWidth: 1,
    shadowRadius: 4,
  },
  patientNameTextStyle: {
    ...text('SB', 14, SHERPA_BLUE, 1, 19, 0),
    width: '68%',
  },
  genderAgeTextStyle: {
    ...text('M', 12, SHERPA_BLUE, 1, 15.6, -0.36),
    textAlign: 'right',
  },
  arrowStyle: {
    height: 18,
    width: 20,
    resizeMode: 'contain',
  },
  itemNameText: {
    ...text('M', 14.5, '#313131', 1, 19.1),
  },
  cartItemsFlatList: {
    borderColor: 'rgba(2,71,91,0.2)',
    borderWidth: 1.5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: colors.WHITE,
    borderStyle: 'solid',
    overflow: 'hidden',
    marginTop: -10,
  },
  patientSelectTouch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  checkBoxIcon: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
  },
  arrowIconView: {
    width: '7%',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 5,
  },
  buttonView: {
    marginLeft: -16,
    marginRight: -16,
    marginBottom: screenHeight > 1000 ? 20 : -3,
  },
  multiPatientText: {
    ...text('B', 16, SHERPA_BLUE, 1, 24),
    marginBottom: 10,
  },
  multiPatientCTAView: { marginTop: 16, width: '87%', alignSelf: 'center' },
  patientSelectionCountView: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  selectedPatientCount: { ...theme.viewStyles.text('SB', 14, theme.colors.SHERPA_BLUE, 1, 20) },
  selectedPatientCountText: {
    ...theme.viewStyles.text('R', 14, theme.colors.SHERPA_BLUE, 1, 24),
  },
  stickyBottomStyle: {
    shadowColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: -10,
  },
  itemStyleView: {
    flex: 1,
    padding: 5,
  },
  mainContainerView: { marginVertical: 16, flex: 1, padding: 10 },
  minorAgeText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 16),
  },
  minorAgeTextView: { marginTop: 4, marginBottom: 4 },
  genderSkuMsgView: {
    marginVertical: 6,
    flexDirection: 'row',
    marginHorizontal: -10,
    backgroundColor: 'transparent',
    marginBottom: -16,
  },
  infoIconStyle: { height: 18, width: 18, resizeMode: 'contain', marginRight: 5 },
});
