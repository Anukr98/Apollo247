import { PlusIconWhite } from '@aph/mobile-patients/src/components/ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Alert,
} from 'react-native';
import {
  formatAddressToLocation,
  g,
  isEmptyObject,
  nameFormater,
  checkPatientAge,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { NavigationScreenProps, SafeAreaView } from 'react-navigation';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { PatientList } from '@aph/mobile-patients/src/components/Tests/components/PatientList';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import AsyncStorage from '@react-native-community/async-storage';
import {
  DiagnosticData,
  LocationData,
  useAppCommonData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { diagnosticServiceability } from '@aph/mobile-patients/src/helpers/clientCalls';
import { useApolloClient } from 'react-apollo-hooks';
import {
  findDiagnosticsByItemIDsAndCityID,
  findDiagnosticsByItemIDsAndCityIDVariables,
  findDiagnosticsByItemIDsAndCityID_findDiagnosticsByItemIDsAndCityID_diagnostics,
} from '@aph/mobile-patients/src/graphql/types/findDiagnosticsByItemIDsAndCityID';
import {
  GET_DIAGNOSTICS_BY_ITEMIDS_AND_CITYID,
  GET_PATIENT_ADDRESS_LIST,
} from '@aph/mobile-patients/src/graphql/profiles';
import { getPricesForItem, sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DIAGNOSTIC_GROUP_PLAN } from '@aph/mobile-patients/src/helpers/apiCalls';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  SCREEN_NAMES,
  TimelineWizard,
} from '@aph/mobile-patients/src/components/Tests/components/TimelineWizard';

const screenHeight = Dimensions.get('window').height;

type Address = savePatientAddress_savePatientAddress_patientAddress;

export interface AddPatientsProps extends NavigationScreenProps {}

export const AddPatients: React.FC<AddPatientsProps> = (props) => {
  const { currentPatient, setCurrentPatientId } = useAllCurrentPatients();
  //need to handle modify flow once.
  const {
    setCartItems,
    removeCartItem,
    updateCartItem,
    cartItems,
    isDiagnosticCircleSubscription,
    modifiedOrder,
    selectedPatient,
    showSelectedPatient,
    setDeliveryAddressId,
    setDeliveryAddressCityId,
    addresses,
    setAddresses: setTestAddress,
  } = useDiagnosticsCart();

  const { setAddresses } = useShoppingCart();
  const {
    diagnosticLocation,
    diagnosticServiceabilityData,
    setDiagnosticServiceabilityData,
    setDiagnosticLocation,
    setLocationDetails,
  } = useAppCommonData();
  const isModifyFlow = !!modifiedOrder && !isEmptyObject(modifiedOrder);
  const client = useApolloClient();

  const { setLoading, showAphAlert, hideAphAlert, loading } = useUIElements();
  const [isServiceable, setIsServiceable] = useState<boolean>(false);

  useEffect(() => {
    const didFocus = props.navigation.addListener('didFocus', (payload) => {
      BackHandler.addEventListener('hardwareBackPress', handleBack);
    });
    const willBlur = props.navigation.addListener('willBlur', (payload) => {
      BackHandler.removeEventListener('hardwareBackPress', handleBack);
    });
    return () => {
      didFocus && didFocus.remove();
      willBlur && willBlur.remove();
    };
  }, []);

  function handleBack() {
    props.navigation.goBack();
    return true;
  }

  useEffect(() => {
    addresses?.length == 0 && fetchAddress();
  }, []);

  useEffect(() => {
    if (
      (!!diagnosticServiceabilityData &&
        !isEmptyObject(diagnosticServiceabilityData) &&
        cartItems?.length > 0) ||
      (!!diagnosticLocation && !isEmptyObject(diagnosticLocation) && cartItems?.length > 0)
    ) {
      getAddressServiceability();
    }
  }, []);

  function saveDiagnosticLocation(locationDetails: LocationData) {
    setDiagnosticLocation?.(locationDetails);
    setLocationDetails?.(locationDetails);
  }

  async function fetchAddress() {
    try {
      setLoading?.(true);
      const response = await client.query<getPatientAddressList, getPatientAddressListVariables>({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: currentPatient?.id },
        fetchPolicy: 'no-cache',
      });
      const addressList = (response?.data?.getPatientAddressList?.addressList as Address[]) || [];
      setAddresses?.(addressList);
      setTestAddress?.(addressList);

      //set the default address
      const deliveryAddress = addressList?.find((item) => item?.defaultAddress);
      if (deliveryAddress) {
        setDeliveryAddressId?.(deliveryAddress?.id);
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
            setLoading?.(false);
            showAphAlert?.({
              unDismissable: true,
              title: string.common.uhOh,
              description: string.diagnostics.pricesChangedMessage,
              onPressOk: () => {
                hideAphAlert?.();
              },
            });
            updateCartItem?.({
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
            });
          }
        }
        //if items not available
        if (disabledCartItems?.length) {
          isItemDisable = true;
          const disabledCartItemIds = disabledCartItems?.map((item) => item.id);
          setLoading?.(false);
          removeDisabledCartItems(disabledCartItemIds);

          showAphAlert?.({
            title: string.common.uhOh,
            description: string.diagnostics.pricesChangedMessage,
            onPressOk: () => {
              hideAphAlert?.();
            },
          });
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
    //whatever is there on homepage -> in diagnosticLocation
    let obj = {} as DiagnosticData;
    setLoading?.(true);
    try {
      const serviceabilityResponse = await diagnosticServiceability(
        client,
        Number(diagnosticLocation?.latitude),
        Number(diagnosticLocation?.longitude)
      );
      if (
        !serviceabilityResponse?.errors &&
        serviceabilityResponse?.data?.getDiagnosticServiceability
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
          setIsServiceable(true);
          //call prices api.
          getDiagnosticsAvailability(getServiceableResponse?.cityID!, cartItems)
            .then(({ data }) => {
              const diagnosticItems =
                g(data, 'findDiagnosticsByItemIDsAndCityID', 'diagnostics') || [];
              updatePricesInCart(diagnosticItems);
              cartItems?.length == 0 && setLoading?.(false);
            })
            .catch((e) => {
              CommonBugFender('AddPatients_getAddressServiceability_getDiagnosticsAvailability', e);
              setLoading?.(false);
              errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
            });
        } else {
          //non-serviceable
          setLoading?.(false);
          showAphAlert?.({
            unDismissable: true,
            title: string.common.uhOh,
            description: string.diagnostics.nonServiceableConfigPinCodeMsg.replace(
              '{{pincode}}',
              diagnosticLocation?.pincode!
            ),
            onPressOk: () => {
              hideAphAlert?.();
              setIsServiceable(false);
              setDeliveryAddressCityId?.('');
              setDeliveryAddressId?.('');
            },
          });
        }
      }
    } catch (error) {
      CommonBugFender('AddPatients_getAddressServiceability', error);
      setIsServiceable(false);
      setLoading?.(false);
      setDeliveryAddressCityId?.('');
      setDeliveryAddressId?.('');
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
        showSelectedPatient?.(newPatient?.profileData);
        changeCurrentProfile(newPatient?.profileData, false);
      }
    }
  };

  const _onPressBackButton = () => {
    //do nothing. need to check the flow
  };

  function _onPressAddPatients() {
    //navigate to add a member screen
    props.navigation.navigate(AppRoutes.EditProfile, {
      isEdit: false,
      isPoptype: true,
      mobileNumber: currentPatient?.mobileNumber,
      onNewProfileAdded: onNewProfileAdded,
      onPressBackButton: _onPressBackButton,
    });
  }

  const renderHeading = () => {
    return (
      <View style={[styles.rowStyle, styles.headingContainer]}>
        <Text style={styles.patientHeadingText}>
          {nameFormater(string.diagnosticsCartPage.patientHeading, 'title')}
        </Text>
        <TouchableOpacity onPress={() => _onPressAddPatients()} style={{ width: 120 }}>
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
      <View style={{ marginTop: 12 }}>
        <Text style={styles.subHeadingText}>
          {string.diagnosticsCartPage.subHeadingMultipleUHID}
        </Text>
      </View>
    );
  };

  function _selectedPatientAction(item: any) {
    const isInValidUser = checkPatientAge(item);
    if (isInValidUser) {
      showSelectedPatient?.(null);
    } else {
      showSelectedPatient?.(item);
    }
  }

  const renderPatientsList = () => {
    return (
      <View style={styles.patientListView}>
        <PatientList
          itemsInCart={cartItems}
          isCircleSubscribed={isDiagnosticCircleSubscription}
          patientSelected={selectedPatient}
          onPressSelectedPatient={(item) => _selectedPatientAction(item)}
        />
      </View>
    );
  };

  function _navigateToCartPage() {
    if (addresses?.length == 0) {
      props.navigation.navigate(AppRoutes.AddAddressNew, {
        addOnly: true,
        source: 'Diagnostics Cart' as AddressSource,
      });
    } else {
      props.navigation.navigate(AppRoutes.CartPage);
    }
  }

  const renderStickyBottom = () => {
    return (
      <StickyBottomComponent>
        <Button
          title={'CONTINUE'}
          onPress={() => _navigateToCartPage()}
          disabled={!(!!selectedPatient && isServiceable)}
        />
      </StickyBottomComponent>
    );
  };

  const renderMainView = () => {
    return (
      <View style={{ margin: 16 }}>
        {renderHeading()}
        {renderSubHeading()}
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={[{ ...theme.viewStyles.container }]}>
        {renderHeader()}
        {renderWizard()}
        {renderMainView()}
      </SafeAreaView>
      {renderStickyBottom()}
    </View>
  );
};

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
  headingContainer: { height: 35, alignItems: 'center' },
  subHeadingText: {
    ...theme.viewStyles.text('R', 12, theme.colors.SHERPA_BLUE, 1, 18),
  },
  patientListView: { flexGrow: 1, marginBottom: 16, height: screenHeight - 220 },
});
