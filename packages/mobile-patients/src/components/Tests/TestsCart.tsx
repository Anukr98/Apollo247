import {
  aphConsole,
  formatAddress,
  g,
  isValidTestSlot,
  formatTestSlot,
  postWebEngageEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { MedicineUploadPrescriptionView } from '@aph/mobile-patients/src/components/Medicines/MedicineUploadPrescriptionView';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CalendarShow, TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_DIAGNOSTIC_IT_DOSE_SLOTS,
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  SEARCH_DIAGNOSTICS_BY_ID,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  GetDiagnosticItDoseSlots,
  GetDiagnosticItDoseSlotsVariables,
  GetDiagnosticItDoseSlots_getDiagnosticItDoseSlots_slotInfo,
} from '@aph/mobile-patients/src/graphql/types/GetDiagnosticItDoseSlots';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  Clinic,
  getPlaceInfoByLatLng,
  getPlaceInfoByPincode,
  searchClinicApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import Geolocation from '@react-native-community/geolocation';
import {
  searchDiagnosticsById_searchDiagnosticsById_diagnostics,
  searchDiagnosticsById,
  searchDiagnosticsByIdVariables,
} from '@aph/mobile-patients/src/graphql/types/searchDiagnosticsById';
import { TestSlotSelectionOverlay } from '@aph/mobile-patients/src/components/Tests/TestSlotSelectionOverlay';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { postPharmacyAddNewAddressClick } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { AddressSource } from '@aph/mobile-patients/src/components/Medicines/AddAddress';

const styles = StyleSheet.create({
  labelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  labelTextStyle: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  yellowTextStyle: {
    ...theme.viewStyles.yellowTextStyle,
    paddingTop: 16,
  },
  blueTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  dateTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

type clinicHoursData = {
  week: string;
  time: string;
};

export type TestSlot = Omit<
  GetDiagnosticItDoseSlots_getDiagnosticItDoseSlots_slotInfo,
  '__typename'
>;
export interface TestsCartProps extends NavigationScreenProps {}

export const TestsCart: React.FC<TestsCartProps> = (props) => {
  const {
    removeCartItem,
    cartItems,
    setCartItems,
    setAddresses,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    cartTotal,
    couponDiscount,
    grandTotal,
    uploadPrescriptionRequired,
    setPhysicalPrescriptions,
    physicalPrescriptions,
    pinCode,
    setPinCode,
    clinicId,
    setClinicId,
    clinics,
    setClinics,
    ePrescriptions,
    forPatientId,
    setPatientId,
    diagnosticSlot,
    setDiagnosticClinic,
    setDiagnosticSlot,
    setEPrescriptions,
    deliveryCharges,
    coupon,
  } = useDiagnosticsCart();
  const { setAddresses: setMedAddresses } = useShoppingCart();

  const clinicHours: clinicHoursData[] = [
    {
      week: 'Mon - Fri',
      time: '9:00 AM - 5:00 PM',
    },
    {
      week: 'Sat - Sun',
      time: '10:00 AM - 3:30 PM',
    },
  ];
  const tabs = [
    { title: 'Home Visit', subtitle: 'Appointment Slot' },
    { title: 'Clinic Visit', subtitle: 'Clinic Hours' },
  ];

  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<TestSlot>();
  const [selectedTab, setselectedTab] = useState<string>(clinicId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient && currentPatient!.id;
  const client = useApolloClient();
  const { locationForDiagnostics, locationDetails } = useAppCommonData();

  const { setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const [clinicDetails, setClinicDetails] = useState<Clinic[] | undefined>([]);

  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>({
    ...((currentPatient || {}) as any),
  });
  const [displaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showSpinner, setshowSpinner] = useState<boolean>(false);
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>();
  const [isEPrescriptionUploadComplete, setisEPrescriptionUploadComplete] = useState<boolean>();
  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const [testCentresLoaded, setTestCentresLoaded] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  useEffect(() => {
    fetchAddresses();
  }, [currentPatient]);

  useEffect(() => {
    if (cartItems.length) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_CART_VIEWED] = {
        'Total items in cart': cartItems.length,
        'Sub Total': cartTotal,
        'Delivery charge': deliveryCharges,
        'Total Discount': couponDiscount,
        'Net after discount': grandTotal,
        'Prescription Needed?': uploadPrescriptionRequired,
        'Cart Items': cartItems.map(
          (item) =>
            (({
              id: item.id,
              name: item.name,
              price: item.price,
              specialPrice: item.specialPrice || item.price,
            } as unknown) as DiagnosticsCartItem)
        ),
        'Service Area': 'Diagnostic',
      };
      if (coupon) {
        eventAttributes['Coupon code used'] = coupon.code;
      }
      postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_CART_VIEWED, eventAttributes);
    }
  }, []);

  const postwebEngageProceedToPayEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED] = {
      'Total items in cart': cartItems.length,
      'Sub Total': cartTotal,
      'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Prescription Needed?': uploadPrescriptionRequired,
      'Mode of Sample Collection': selectedTab === tabs[0].title ? 'Home Visit' : 'Clinic Visit',
      'Pin Code': pinCode,
      'Service Area': 'Diagnostic',
    };
    postWebEngageEvent(WebEngageEventName.DIAGNOSTIC_PROCEED_TO_PAY_CLICKED, eventAttributes);
  };

  useEffect(() => {
    onFinishUpload();
  }, [isEPrescriptionUploadComplete, isPhysicalUploadComplete]);

  useEffect(() => {
    setPatientId!(currentPatientId!);
  }, [currentPatientId]);

  useEffect(() => {
    if (deliveryAddressId) {
      if (diagnosticSlot) {
        setDate(new Date(diagnosticSlot.date));
        setselectedTimeSlot({
          // date: new Date(diagnosticSlot.date),
          Timeslot: diagnosticSlot.Timeslot,
          TimeslotID: diagnosticSlot.TimeslotID,
        });
      } else {
        setDate(new Date());
        setselectedTimeSlot(undefined);
        const selectedAddressIndex = addresses.findIndex(
          (address) => address.id == deliveryAddressId
        );
        checkServicability(addresses[selectedAddressIndex]);
      }
    }
  }, [deliveryAddressId, diagnosticSlot]);

  useEffect(() => {
    clinics.length == 0 && fetchStorePickup();
    slicedStoreList.length == 0 && filterClinics(clinicId, true, true);
  }, [clinicId]);

  useEffect(() => {
    if (testCentresLoaded) {
      if (!(locationDetails && locationDetails.pincode)) {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            getPlaceInfoByLatLng(latitude, longitude)
              .then((obj) => {
                try {
                  if (
                    obj.data.results.length > 0 &&
                    obj.data.results[0].address_components.length > 0
                  ) {
                    const address = obj.data.results[0].address_components[0].short_name;
                    console.log(address, 'address obj');
                    const addrComponents = obj.data.results[0].address_components || [];
                    const _pincode = (
                      addrComponents.find((item: any) => item.types.indexOf('postal_code') > -1) ||
                      {}
                    ).long_name;
                    filterClinics(_pincode || '');
                  }
                } catch (e) {
                  CommonBugFender('TestsCart_getPlaceInfoByLatLng_try', e);
                }
              })
              .catch((error) => {
                CommonBugFender('TestsCart_getPlaceInfoByLatLng', error);
                console.log(error, 'geocode error');
              });
          },
          (error) => {
            console.log(error.code, error.message, 'getCurrentPosition error');
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
        console.log('pincode');
      } else {
        filterClinics(locationDetails.pincode || '');
      }
    }
  }, [testCentresLoaded]);

  const renderAlert = (message: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: message,
    });
  };

  const fetchAddresses = async () => {
    try {
      if (addresses.length) {
        return;
      }
      setLoading!(true);
      const userId = g(currentPatient, 'id');
      const addressApiCall = await client.query<
        getPatientAddressList,
        getPatientAddressListVariables
      >({
        query: GET_PATIENT_ADDRESS_LIST,
        variables: { patientId: userId },
        fetchPolicy: 'no-cache',
      });
      const addressList =
        (addressApiCall.data.getPatientAddressList
          .addressList as savePatientAddress_savePatientAddress_patientAddress[]) || [];
      setAddresses!(addressList);
      setMedAddresses!(addressList);
      setLoading!(false);
    } catch (error) {
      setLoading!(false);
      renderAlert(`Something went wrong, unable to fetch addresses.`);
    }
  };

  const onRemoveCartItem = ({ id }: DiagnosticsCartItem) => {
    removeCartItem && removeCartItem(id);
  };

  const renderHeader = () => {
    return (
      <Header
        container={{
          ...theme.viewStyles.cardViewStyle,
          borderRadius: 0,
        }}
        leftIcon={'backArrow'}
        title={'TESTS CART'}
        titleStyle={{ marginLeft: 20 }}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => props.navigation.navigate('TESTS', { focusSearch: true })}
            >
              <Text
                style={{
                  ...theme.fonts.IBMPlexSansSemiBold(13),
                  color: theme.colors.APP_YELLOW,
                }}
              >
                ADD ITEMS
              </Text>
            </TouchableOpacity>
          </View>
        }
        onPressLeftIcon={() => props.navigation.goBack()}
      />
    );
  };

  const renderLabel = (label: string, rightText?: string) => {
    return (
      <View style={styles.labelView}>
        <Text style={styles.labelTextStyle}>{label}</Text>
        {rightText && <Text style={styles.labelTextStyle}>{rightText}</Text>}
      </View>
    );
  };

  const errorAlert = (description?: string) => {
    showAphAlert!({
      title: string.common.uhOh,
      description: description || 'Unable to fetch test details.',
    });
  };

  const fetchPackageDetails = (
    itemIds: string,
    func: (product: searchDiagnosticsById_searchDiagnosticsById_diagnostics) => void
  ) => {
    {
      setLoading!(true);
      client
        .query<searchDiagnosticsById, searchDiagnosticsByIdVariables>({
          query: SEARCH_DIAGNOSTICS_BY_ID,
          variables: {
            itemIds: itemIds,
          },
          fetchPolicy: 'no-cache',
        })
        .then(({ data }) => {
          console.log('searchDiagnostics\n', { data });
          const product = g(data, 'searchDiagnosticsById', 'diagnostics', '0' as any);
          if (product) {
            func && func(product);
          } else {
            errorAlert();
          }
        })
        .catch((e) => {
          CommonBugFender('TestsCart_fetchPackageDetails', e);
          console.log({ e });
          errorAlert();
        })
        .finally(() => {
          setLoading!(false);
        });
    }
  };

  const renderItemsInCart = () => {
    const cartItemsCount =
      cartItems.length > 10 || cartItems.length == 0
        ? `${cartItems.length}`
        : `0${cartItems.length}`;
    return (
      <View>
        {renderLabel('ITEMS IN YOUR CART', cartItemsCount)}
        {cartItems.length == 0 && (
          <Text
            style={{
              color: theme.colors.FILTER_CARD_LABEL,
              ...theme.fonts.IBMPlexSansMedium(13),
              margin: 20,
              textAlign: 'center',
              opacity: 0.3,
            }}
          >
            Your Cart is empty
          </Text>
        )}
        {cartItems.map((test, index, array) => {
          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? { marginBottom: 20 } : {},
          ];
          const imageUrl =
            test.thumbnail && !test.thumbnail.includes('/default/placeholder')
              ? test.thumbnail.startsWith('http')
                ? test.thumbnail
                : `${AppConfig.Configuration.IMAGES_BASE_URL}${test.thumbnail}`
              : '';

          return (
            <MedicineCard
              // personName={
              //   currentPatient && currentPatient.firstName ? currentPatient.firstName : ''
              // }
              containerStyle={medicineCardContainerStyle}
              key={test.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Navigate to medicine details scene');
                fetchPackageDetails(test.id, (product) => {
                  props.navigation.navigate(AppRoutes.TestDetails, {
                    testDetails: {
                      ItemID: test.id,
                      ItemName: test.name,
                      Rate: test!.price,
                      FromAgeInDays: product.fromAgeInDays!,
                      ToAgeInDays: product.toAgeInDays!,
                      Gender: product.gender,
                      collectionType: test.collectionMethod,
                      preparation: product.testPreparationData,
                    } as TestPackageForDetails,
                  });
                });
              }}
              medicineName={test.name!}
              price={test.price!}
              imageUrl={imageUrl}
              onPressAdd={() => {}}
              onPressRemove={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Remove item from cart');
                onRemoveCartItem(test);
              }}
              onChangeUnit={() => {}}
              isCardExpanded={true}
              isInStock={true}
              isTest={true}
              specialPrice={test.specialPrice!}
              isPrescriptionRequired={false}
              subscriptionStatus={'unsubscribed'}
              packOfCount={test.mou}
              onChangeSubscription={() => {}}
              onEditPress={() => {}}
              onAddSubscriptionPress={() => {}}
            />
          );
        })}
      </View>
    );
  };

  const [checkingServicability, setCheckingServicability] = useState(false);

  const checkServicability = (
    selectedAddress: savePatientAddress_savePatientAddress_patientAddress
  ) => {
    if (!checkingServicability) {
      setCheckingServicability(true);
      client
        .query<GetDiagnosticItDoseSlots, GetDiagnosticItDoseSlotsVariables>({
          query: GET_DIAGNOSTIC_IT_DOSE_SLOTS,
          fetchPolicy: 'no-cache',
          variables: {
            patientId: g(currentPatient, 'id') || '',
            selectedDate: moment(date).format('YYYY-MM-DD'),
            zipCode: Number(selectedAddress.zipcode!),
          },
        })
        .then(({ data }) => {
          const diagnosticSlots =
            (g(data, 'getDiagnosticItDoseSlots', 'slotInfo') as TestSlot[]) || [];
          console.log('ORIGINAL DIAGNOSTIC SLOTS', { diagnosticSlots });
          const slotsArray = diagnosticSlots.filter((slot) => isValidTestSlot(slot, date));
          console.log('ARRAY OF SLOTS', { slotsArray });
          setSlots(slotsArray);
          setselectedTimeSlot(slotsArray[0]);
          setDeliveryAddressId!(selectedAddress.id);
          setPinCode!(selectedAddress.zipcode!);
          setDisplaySchedule(true);
        })
        .catch((e) => {
          CommonBugFender('TestsCart_checkServicability', e);
          console.log('Error occured', { e });
          setDiagnosticSlot && setDiagnosticSlot(null);
          setselectedTimeSlot(undefined);
          const noHubSlots = g(e, 'graphQLErrors', '0', 'message') === 'NO_HUB_SLOTS';

          if (noHubSlots) {
            setDeliveryAddressId!(selectedAddress.id);
            setPinCode!(selectedAddress.zipcode!);
            showAphAlert!({
              title: 'Uh oh.. :(',
              description: `Sorry! There are no slots available on ${moment(date).format(
                'DD MMM, YYYY'
              )}. Please choose another date.`,
              onPressOk: () => {
                setDisplaySchedule(true);
                hideAphAlert && hideAphAlert();
              },
            });
          } else {
            setDeliveryAddressId && setDeliveryAddressId('');
            // setPinCode && setPinCode('');
            showAphAlert!({
              title: 'Uh oh.. :(',
              description:
                'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.',
            });
          }
        })
        .finally(() => {
          setCheckingServicability(false);
        });
    }
  };

  const renderHomeDelivery = () => {
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);
    const addressListLength = addresses.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;

    return (
      <View
        style={{ marginTop: 8, marginHorizontal: 16 }}
        pointerEvents={checkingServicability ? 'none' : 'auto'}
      >
        {checkingServicability ? (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              alignSelf: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator size="large" color="green" />
          </View>
        ) : null}
        {addresses.slice(startIndex, startIndex + 2).map((item, index, array) => {
          return (
            <RadioSelectionItem
              key={item.id}
              title={formatAddress(item)}
              isSelected={deliveryAddressId == item.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Check service availability');
                const tests = cartItems.filter(
                  (item) => item.collectionMethod == TEST_COLLECTION_TYPE.CENTER
                );

                if (tests.length) {
                  showAphAlert!({
                    title: string.common.uhOh,
                    description: `${(currentPatient && currentPatient.firstName) ||
                      'Hi'}, since your cart includes tests (${tests
                      .map((item) => item.name)
                      .join(
                        ', '
                      )}), that can only be done at the centre, we request you to get all tests in your cart done at the centre of your convenience. Please proceed to select.`,
                  });
                } else {
                  checkServicability(item);
                }
              }}
              containerStyle={{ marginTop: 16 }}
              hideSeparator={index + 1 === array.length}
            />
          );
        })}
        <View style={[styles.rowSpaceBetweenStyle, { paddingBottom: 16 }]}>
          <Text
            style={styles.yellowTextStyle}
            onPress={() => {
              postPharmacyAddNewAddressClick('Diagnostics Cart');
              props.navigation.navigate(AppRoutes.AddAddress, {
                addOnly: true,
                source: 'Diagnostics Cart' as AddressSource,
              });
              setDiagnosticSlot && setDiagnosticSlot(null);
              setselectedTimeSlot(undefined);
            }}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addresses.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => {
                  props.navigation.navigate(AppRoutes.SelectDeliveryAddress, {
                    isTest: true,
                    selectedAddressId: deliveryAddressId,
                    isChanged: (val: boolean, id?: string) => {
                      if (val && id) {
                        setDeliveryAddressId && setDeliveryAddressId(id);
                        setDiagnosticSlot && setDiagnosticSlot(null);
                        setselectedTimeSlot(undefined);
                      }
                    },
                  });
                }}
              >
                VIEW ALL
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  useEffect(() => {
    if (pinCode.length !== 6) {
      setSlicedStoreList([]);
      setClinicId!('');
    }
  }, [pinCode]);

  const fetchStorePickup = () => {
    setStorePickUpLoading(true);
    searchClinicApi()
      .then((data) => {
        setStorePickUpLoading(false);
        aphConsole.log('clinic response', data.data.data, data);
        setClinics && setClinics(data.data.data || []);
        setTimeout(() => {
          setTestCentresLoaded(true);
        }, 100);
        updateClinicSelection();
      })
      .catch((e) => {
        CommonBugFender('TestsCart_searchClinicApi', e);
        setStorePickUpLoading(false);
      });
  };

  const filterClinics = (key: string, isId?: boolean, hideLoader?: boolean) => {
    if (isId) {
      const data = clinics.filter((item) => item.CentreCode === key);
      aphConsole.log('iid filer=', data);
      filterClinics(pinCode, false, true);
      setClinicDetails(data);
    } else {
      if (isValidPinCode(key)) {
        setPinCode && setPinCode(key);
        if (key.length == 6) {
          Keyboard.dismiss();
          !hideLoader && setStorePickUpLoading(true);
          getPlaceInfoByPincode(key)
            .then((data) => {
              const city = (
                (data.data.results[0].address_components || []).find(
                  (item: any) => item.types.indexOf('locality') > -1
                ) || {}
              ).long_name;
              aphConsole.log('cityName', city);
              let filterArray;
              city &&
                (filterArray = clinics.filter((item) =>
                  item.City.toLowerCase().includes(city.toLowerCase())
                ));

              setClinicDetails(filterArray || []);
              setSlicedStoreList((filterArray || []).slice(0, 2));
            })
            .catch((e) => {
              CommonBugFender('TestsCart_filterClinics', e);
              setClinicDetails([]);
            })
            .finally(() => {
              setStorePickUpLoading(false);
            });
        }
      }
    }
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', () => {
      updateClinicSelection();
    });
    const _willBlurSubscription = props.navigation.addListener('willBlur', () => {
      updateClinicSelection();
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, [clinics, clinicId, clinicDetails]);

  const [slicedStoreList, setSlicedStoreList] = useState<Clinic[]>([]);

  const updateClinicSelection = () => {
    const selectedStoreIndex =
      clinicDetails && clinicDetails.findIndex(({ CentreCode }) => CentreCode == clinicId);
    const storesLength = clinicDetails && clinicDetails.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength! - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const _slicedStoreList = [...clinicDetails!].slice(startIndex, startIndex! + 2);
    setSlicedStoreList(_slicedStoreList);
  };

  const renderStorePickup = () => {
    return (
      <View style={{ margin: 16, marginTop: 20 }}>
        <TextInputComponent
          value={`${pinCode}`}
          maxLength={6}
          onChangeText={(pincode) => {
            filterClinics(pincode);
          }}
          placeholder={'Enter Pincode'}
        />
        {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
        {!storePickUpLoading && pinCode.length == 6 && slicedStoreList!.length == 0 && (
          <Text
            style={{
              paddingTop: 10,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            {string.diagnostics.nonServiceablePinCodeMsg}
          </Text>
        )}

        {slicedStoreList.map((item, index, array) => (
          <RadioSelectionItem
            key={item.CentreCode}
            title={`${item.CentreName}\n${item.Locality},${item.City},${item.State}`}
            isSelected={clinicId === item.CentreCode}
            onPress={() => {
              CommonLogEvent(AppRoutes.TestsCart, 'Set store id');
              setDiagnosticClinic!({ ...item, date: date.getTime() });
              setClinicId && setClinicId(item.CentreCode);
            }}
            containerStyle={{ marginTop: 16 }}
            hideSeparator={index == array.length - 1}
          />
        ))}
        <View>
          {clinicDetails!.length > 2 && (
            <Text
              style={{ ...styles.yellowTextStyle, textAlign: 'right', paddingBottom: 0 }}
              onPress={() =>
                props.navigation.navigate(AppRoutes.ClinicSelection, {
                  pincode: pinCode,
                  clinics: clinicDetails,
                })
              }
            >
              VIEW ALL
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderPickupHours = () => {
    return (
      <View>
        <View style={styles.rowSpaceBetweenStyle}>
          <Text style={styles.dateTextStyle}>Date</Text>
          <Text style={styles.dateTextStyle}>{moment(date).format('DD MMM, YYYY')}</Text>
        </View>
        <View style={styles.rowSpaceBetweenStyle}>
          <Text style={styles.dateTextStyle}>Time</Text>
          <Text style={styles.dateTextStyle}>
            {selectedTimeSlot
              ? `${formatTestSlot(selectedTimeSlot.Timeslot!)}`
              : 'No slot selected'}
          </Text>
        </View>
        <Text
          style={[styles.yellowTextStyle, { padding: 0, paddingTop: 20, alignSelf: 'flex-end' }]}
          onPress={() => {
            setDisplaySchedule(true);
          }}
        >
          PICK ANOTHER SLOT
        </Text>
      </View>
    );
  };

  const renderClinicHours = () => {
    return (
      <View>
        {clinicHours.map(({ week, time }) => {
          return (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.dateTextStyle}>{week}</Text>
              <Text style={styles.dateTextStyle}>{time}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderTimingCard = () => {
    return (selectedTab === tabs[0].title && deliveryAddressId && !checkingServicability) ||
      (selectedTab === tabs[1].title && clinicId) ? (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          marginHorizontal: 20,
          marginTop: 4,
          marginBottom: 24,
          padding: 16,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <CalendarShow />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
            }}
          >
            {selectedTab === tabs[0].title ? tabs[0].subtitle : tabs[1].subtitle}
          </Text>
        </View>
        <View style={[styles.separatorStyle, { marginTop: 10, marginBottom: 12.5 }]} />
        {selectedTab === tabs[0].title ? renderPickupHours() : renderClinicHours()}
      </View>
    ) : (
      <View style={{ padding: 12 }}></View>
    );
  };

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel('WHERE TO COLLECT SAMPLE FROM?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          <TabsComponent
            style={{
              borderRadius: 0,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: 'rgba(2, 71, 91, 0.2)',
            }}
            data={tabs}
            onChange={(selectedTab) => {
              setselectedTab(selectedTab);
              setClinicId!('');
              setDeliveryAddressId!('');
              // setPinCode!('');
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
        {renderTimingCard()}
      </View>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginBottom: 12,
            padding: 16,
            marginTop: 16,
          }}
        >
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>Subtotal</Text>
            <Text style={styles.blueTextStyle}>Rs. {cartTotal.toFixed(2)}</Text>
          </View>
          {couponDiscount > 0 && (
            <View style={styles.rowSpaceBetweenStyle}>
              <Text style={styles.blueTextStyle}>Coupon Discount</Text>
              <Text style={styles.blueTextStyle}>- Rs. {couponDiscount.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.separatorStyle, { marginTop: 16, marginBottom: 7 }]} />
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>To Pay </Text>
            <Text style={[styles.blueTextStyle, { ...theme.fonts.IBMPlexSansBold }]}>
              Rs. {grandTotal.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const disableProceedToPay = !(
    cartItems.length > 0 &&
    forPatientId &&
    !!((deliveryAddressId && selectedTimeSlot) || clinicId) &&
    (uploadPrescriptionRequired
      ? physicalPrescriptions.length > 0 || ePrescriptions.length > 0
      : true)
  );

  const multiplePhysicalPrescriptionUpload = (prescriptions = physicalPrescriptions) => {
    return Promise.all(
      prescriptions.map((item) =>
        client.mutate<uploadDocument>({
          mutation: UPLOAD_DOCUMENT,
          fetchPolicy: 'no-cache',
          variables: {
            UploadDocumentInput: {
              base64FileInput: item.base64,
              category: 'HealthChecks',
              fileType: item.fileType == 'jpg' ? 'JPEG' : item.fileType.toUpperCase(),
              patientId: currentPatient && currentPatient!.id,
            },
          },
        })
      )
    );
  };

  const physicalPrescriptionUpload = () => {
    const prescriptions = physicalPrescriptions;
    setLoading!(true);
    const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
    console.log('unUploadedPres', unUploadedPres);
    if (unUploadedPres.length > 0) {
      multiplePhysicalPrescriptionUpload(unUploadedPres)
        .then((data) => {
          const uploadUrls = data.map((item) =>
            item.data!.uploadDocument.status
              ? {
                  fileId: item.data!.uploadDocument.fileId!,
                  url: item.data!.uploadDocument.filePath!,
                }
              : null
          );

          const newuploadedPrescriptions = unUploadedPres.map(
            (item, index) =>
              ({
                ...item,
                uploadedUrl: uploadUrls![index]!.url,
                prismPrescriptionFileId: uploadUrls![index]!.fileId,
              } as PhysicalPrescription)
          );
          console.log('precp:di', newuploadedPrescriptions);

          setPhysicalPrescriptions && setPhysicalPrescriptions([...newuploadedPrescriptions]);
          setisPhysicalUploadComplete(true);
        })
        .catch((e) => {
          CommonBugFender('TestsCart_physicalPrescriptionUpload', e);
          aphConsole.log({ e });
          setLoading!(false);
          showAphAlert!({
            title: 'Uh oh.. :(',
            description: 'Error occurred while uploading prescriptions.',
          });
        });
    } else {
      setisPhysicalUploadComplete(true);
    }
  };

  const ePrescriptionUpload = () => {
    setLoading!(true);
    setisEPrescriptionUploadComplete(true);
  };

  const onFinishUpload = () => {
    if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length == 0 &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    } else if (
      physicalPrescriptions.length == 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete
    ) {
      setLoading!(false);
      setisEPrescriptionUploadComplete(false);
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    } else if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      setisEPrescriptionUploadComplete(false);
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    }
  };

  const getDiagnosticsAvailability = (cartItems: DiagnosticsCartItem[]) => {
    const itemIds = cartItems.map((item) => item.id).toString();
    return client.query<searchDiagnosticsById, searchDiagnosticsByIdVariables>({
      query: SEARCH_DIAGNOSTICS_BY_ID,
      variables: { itemIds },
      fetchPolicy: 'no-cache',
    });
  };

  const moveForward = () => {
    const prescriptions = physicalPrescriptions;
    if (prescriptions.length == 0 && ePrescriptions.length == 0) {
      setLoading!(false);
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    } else {
      if (prescriptions.length > 0) {
        physicalPrescriptionUpload();
      }
      if (ePrescriptions.length > 0) {
        ePrescriptionUpload();
      }
    }
  };

  const removeDisabledCartItems = (disabledCartItemIds: string[]) => {
    hideAphAlert!();
    setCartItems!(
      cartItems.filter((cItem) => !disabledCartItemIds.find((dItem) => dItem == cItem.id))
    );
  };

  const onPressProceedToPay = () => {
    try {
      postwebEngageProceedToPayEvent();
      setLoading!(true);
      getDiagnosticsAvailability(cartItems)
        .then(({ data }) => {
          const diagnosticItems = g(data, 'searchDiagnosticsById', 'diagnostics') || [];
          const disabledCartItems = cartItems.filter(
            (cartItem) => !diagnosticItems.find((d) => `${d!.itemId}` == cartItem.id)
          );
          if (disabledCartItems.length) {
            const disabledCartItemNames = disabledCartItems.map((item) => item.name).join(', ');
            const disabledCartItemIds = disabledCartItems.map((item) => item.id);
            setLoading!(false);
            showAphAlert!({
              title: string.common.uhOh,
              description: string.diagnostics.disabledDiagnosticsMsg.replace(
                '{{testNames}}',
                disabledCartItemNames
              ),
              CTAs: [
                {
                  text: (disabledCartItems.length == 1
                    ? string.diagnostics.removeThisTestCTA
                    : string.diagnostics.removeTheseTestsCTA
                  ).toUpperCase(),
                  onPress: () => removeDisabledCartItems(disabledCartItemIds),
                  type: 'orange-button',
                },
              ],
            });
          } else {
            moveForward();
          }
        })
        .catch((e) => {
          CommonBugFender('TestsCart_getDiagnosticsAvailability', e);
          setLoading!(false);
          errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
        });
    } catch (error) {
      CommonBugFender('TestsCart_getDiagnosticsAvailability_try_catch', error);
      errorAlert(string.diagnostics.disabledDiagnosticsFailureMsg);
    }
  };

  const renderProfiles = () => {
    return (
      <View>
        {renderLabel('WHO ARE THESE TESTS FOR?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 20,
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          <ProfileList
            defaultText={'Select who are these tests for'}
            saveUserChange={true}
            selectedProfile={profile}
            navigation={props.navigation}
          ></ProfileList>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              marginTop: 8,
              color: theme.colors.SKY_BLUE,
            }}
          >
            {`All the tests must be for one person. Tests for multiple profiles will require separate purchases.`}
          </Text>
        </View>
      </View>
    );
  };
  const selectedAddr = addresses.find((item) => item.id == deliveryAddressId);
  const zipCode = (deliveryAddressId && selectedAddr && selectedAddr.zipcode) || '0';
  return (
    <View style={{ flex: 1 }}>
      {displaySchedule && (
        <TestSlotSelectionOverlay
          heading="Schedule Appointment"
          date={date}
          maxDate={moment()
            .add(AppConfig.Configuration.DIAGNOSTIC_SLOTS_MAX_FORWARD_DAYS, 'day')
            .toDate()}
          isVisible={displaySchedule}
          onClose={() => setDisplaySchedule(false)}
          slots={slots}
          zipCode={parseInt(zipCode, 10)}
          slotInfo={selectedTimeSlot}
          onSchedule={(date: Date, slotInfo: TestSlot) => {
            console.log({ slotInfo });

            setDate(date);
            setselectedTimeSlot(slotInfo);
            setDiagnosticSlot!({
              ...slotInfo,
              date: date.getTime(),
              city: selectedAddr ? selectedAddr.city! : '', // not using city from this in order place API
            });
            setDisplaySchedule(false);
          }}
        />
      )}
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView bounces={false}>
          <View style={{ marginVertical: 24 }}>
            {renderItemsInCart()}
            {renderProfiles()}
            <MedicineUploadPrescriptionView isTest={true} navigation={props.navigation} />
            {renderDelivery()}
            {renderTotalCharges()}
          </View>
          <View style={{ height: 70 }} />
        </ScrollView>
        <StickyBottomComponent defaultBG>
          <Button
            disabled={disableProceedToPay}
            title={`PROCEED TO PAY RS. ${grandTotal.toFixed(2)}`}
            onPress={() => onPressProceedToPay()}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
      {showSpinner && <Spinner />}
    </View>
  );
};
