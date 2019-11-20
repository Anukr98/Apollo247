import {
  uploadFile,
  uploadFileVariables,
} from '@aph/mobile-patients/src//graphql/types/uploadFile';
import { g, aphConsole } from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  DiagnosticsCartItem,
  useDiagnosticsCart,
} from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { MedicineUploadPrescriptionView } from '@aph/mobile-patients/src/components/Medicines/MedicineUploadPrescriptionView';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { PhysicalPrescription } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { AddProfile } from '@aph/mobile-patients/src/components/ui/AddProfile';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { CalendarShow, TestsIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { ScheduleCalander } from '@aph/mobile-patients/src/components/ui/ScheduleCalander';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_DIAGNOSTIC_SLOTS,
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_FILE,
} from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  Clinic,
  getPlaceInfoByPincode,
  searchClinicApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
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
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  getDiagnosticSlots,
  getDiagnosticSlotsVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlots';
import { TEST_COLLECTION_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { TestPackageForDetails } from '@aph/mobile-patients/src/components/Tests/TestDetails';

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
    padding: 16,
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
  medicineCostStyle: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  rowSpaceBetweenStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionsView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 16,
  },
  buttonStyle: {
    width: 'auto',
    marginRight: 8,
    marginTop: 12,
    backgroundColor: theme.colors.WHITE,
  },
  buttonTextStyle: {
    paddingHorizontal: 12,
    color: theme.colors.APP_GREEN,
    ...theme.fonts.IBMPlexSansMedium(15),
  },
  placeholderViewStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 2,
    paddingTop: 6,
    paddingBottom: 3,
    borderColor: theme.colors.INPUT_BORDER_SUCCESS,
  },
  placeholderStyle: {
    color: theme.colors.placeholderTextColor,
  },
  placeholderTextStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(18),
  },
});

type clinicHoursData = {
  week: string;
  time: string;
};

type TimeArray = {
  label: string;
  time: string;
}[];

type Profile = {
  pid: string;
  name: string;
};

export interface TestsCartProps extends NavigationScreenProps {
  isComingFromConsult: boolean;
}
{
}

export const TestsCart: React.FC<TestsCartProps> = (props) => {
  const isComingFromConsult = props.navigation.getParam('isComingFromConsult');
  const {
    updateCartItem,
    removeCartItem,
    cartItems,
    setAddresses,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    deliveryCharges,
    cartTotal,
    couponDiscount,
    grandTotal,
    coupon,
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
    diagnosticClinic,
    diagnosticSlot,
    setDiagnosticClinic,
    setDiagnosticSlot,
  } = useDiagnosticsCart();

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
  const [timeArray, settimeArray] = useState<TimeArray>([]);

  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');
  const [selectedTab, setselectedTab] = useState<string>(clinicId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient && currentPatient!.id;
  const client = useApolloClient();
  const { showAphAlert, setLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();
  const [clinicDetails, setClinicDetails] = useState<Clinic[] | undefined>([]);

  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>({
    ...((currentPatient || {}) as any),
  });
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [displaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [showSpinner, setshowSpinner] = useState<boolean>(false);

  useEffect(() => {
    setPatientId!(currentPatientId!);
  }, [currentPatientId]);

  useEffect(() => {
    if (deliveryAddressId) {
      if (diagnosticSlot) {
        setDate(new Date(diagnosticSlot.date));
        setselectedTimeSlot(`${diagnosticSlot.slotStartTime} - ${diagnosticSlot.slotEndTime}`);
      } else {
        setDate(new Date());
        const selectedAddressIndex = addresses.findIndex(
          (address) => address.id == deliveryAddressId
        );
        checkServicability(addresses[selectedAddressIndex]);
      }
    }
  }, [deliveryAddressId, diagnosticSlot]);

  useEffect(() => {
    fetchStorePickup();
    if (clinicId) {
      filterClinics(clinicId, true);
    }
  }, [clinicId]);

  useEffect(() => {
    setLoading!(true);
    (currentPatientId &&
      addresses.length == 0 &&
      client
        .query<getPatientAddressList, getPatientAddressListVariables>({
          query: GET_PATIENT_ADDRESS_LIST,
          variables: { patientId: currentPatientId },
          fetchPolicy: 'no-cache',
        })
        .then(({ data: { getPatientAddressList: { addressList } } }) => {
          setLoading!(false);
          setAddresses && setAddresses(addressList!);
        })
        .catch((e) => {
          setLoading!(false);
          showAphAlert!({
            title: `Uh oh.. :(`,
            description: `Something went wrong, unable to fetch addresses.`,
          });
        })) ||
      setLoading!(false);
  }, [currentPatientId]);

  /*  useEffect(() => {
      getCartInfo()
        .then((cartInfo) => {
          setcartDetails(cartInfo);
          let cartStatus = {} as typeof medicineCardStatus;
          cartInfo &&
            cartInfo.items.forEach((item) => {
              cartStatus[item.sku] = {
                isAddedToCart: true,
                isCardExpanded: true,
                unit: item.qty,
                price: item.price!,
              };
            });
          setMedicineCardStatus({
            ...medicineCardStatus,
            ...cartStatus,
          });
          setMedicineList(cartInfo.items);
          setshowSpinner(false);
        })
        .catch((e) => {
          Alert.alert(JSON.stringify({ e }));
          setshowSpinner(false);
        });
    }, []);*/

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
              onPress={() => {
                if (isComingFromConsult)
                  props.navigation.navigate(AppRoutes.SearchTestScene, {
                    isComingFromConsult,
                  });
                else props.navigation.goBack();
              }}
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
                props.navigation.navigate(AppRoutes.TestDetails, {
                  testDetails: {
                    Rate: test!.price,
                    Gender: '',
                    ItemID: `${test.id}`,
                    ItemName: test.name,
                    collectionType: test.collectionMethod,
                  } as TestPackageForDetails,
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

  // const checkServicability = (address: savePatientAddress_savePatientAddress_patientAddress) => {
  //   setCheckingServicability(true);
  //   pinCodeServiceabilityApi(address.zipcode!)
  //     .then(({ data: { Availability } }) => {
  //       setCheckingServicability(false);
  //       if (Availability) {
  //         setDeliveryAddressId && setDeliveryAddressId(address.id);
  //         setPinCode && setPinCode(address.zipcode!);
  //       } else {
  //         showAphAlert!({
  //           title: 'Uh oh.. :(',
  //           description:
  //             'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby clinics, or change the pincode.',
  //         });
  //       }
  //     })
  //     .catch((e) => {
  //       aphaphConsole.log({ e });
  //       setCheckingServicability(false);
  //       handleGraphQlError(e);
  //     });
  // };

  const checkServicability = (
    selectedAddress: savePatientAddress_savePatientAddress_patientAddress
  ) => {
    setCheckingServicability(true);
    client
      .query<getDiagnosticSlots, getDiagnosticSlotsVariables>({
        query: GET_DIAGNOSTIC_SLOTS,
        fetchPolicy: 'no-cache',
        variables: {
          patientId: currentPatient!.id,
          hubCode: 'HYD_HUB1', // not considering this field at backend
          selectedDate: moment(date).format('YYYY-MM-DD'),
          zipCode: parseInt(selectedAddress.zipcode!),
        },
      })
      .then(({ data }) => {
        setDeliveryAddressId && setDeliveryAddressId(selectedAddress.id);
        setPinCode && setPinCode(selectedAddress.zipcode!);
        aphConsole.log({ data }, 'GET_DIAGNOSTIC_SLOTS');
        var finalaray = g(data, 'getDiagnosticSlots', 'diagnosticSlot', '0' as any);
        var t = finalaray!.slotInfo!.map((item) => {
          return {
            label: (item!.slot || '').toString(),
            time: `${item!.startTime} - ${item!.endTime}`,
          };
        });
        aphConsole.log(t, 'finalaray');
        setDiagnosticSlot &&
          setDiagnosticSlot({
            employeeSlotId: finalaray!.slotInfo![0]!.slot!,
            diagnosticBranchCode: data!.getDiagnosticSlots.diagnosticBranchCode!,
            diagnosticEmployeeCode: finalaray!.employeeCode || '',
            slotStartTime: finalaray!.slotInfo![0]!.startTime!.toString(),
            slotEndTime: finalaray!.slotInfo![0]!.endTime!.toString(),
            city: selectedAddress!.city || '',
            date: date.getTime(),
          });
        settimeArray(t);
        setselectedTimeSlot(t[0].time);
      })
      .catch((e) => {
        aphConsole.log('Error occured', { e });
        setDeliveryAddressId && setDeliveryAddressId('');
        setPinCode && setPinCode('');
        setselectedTimeSlot('');
        showAphAlert!({
          title: 'Uh oh.. :(',
          description:
            'Sorry! We’re working hard to get to this area! In the meantime, you can either visit clinic near your location or change the address.',
        });
      })
      .finally(() => {
        setCheckingServicability(false);
      });
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
              title={`${item.addressLine1}, ${item.addressLine2}\n${item.landmark}${
                item.landmark ? ',\n' : ''
              }${item.city}, ${item.state} - ${item.zipcode}`}
              isSelected={deliveryAddressId == item.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.TestsCart, 'Check service availability');
                const tests = cartItems.filter(
                  (item) => item.collectionMethod == TEST_COLLECTION_TYPE.CENTER
                );

                if (tests.length) {
                  showAphAlert!({
                    title: 'Uh oh! :(',
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
        <View style={styles.rowSpaceBetweenStyle}>
          <Text
            style={styles.yellowTextStyle}
            onPress={() => props.navigation.navigate(AppRoutes.AddAddress)}
          >
            ADD NEW ADDRESS
          </Text>
          <View>
            {addresses.length > 2 && (
              <Text
                style={styles.yellowTextStyle}
                onPress={() => {
                  setDiagnosticSlot && setDiagnosticSlot(null);
                  props.navigation.navigate(AppRoutes.SelectDeliveryAddress, { isTest: true });
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

  const [storePickUpLoading, setStorePickUpLoading] = useState<boolean>(false);
  const isValidPinCode = (text: string): boolean => /^(\s*|[1-9][0-9]*)$/.test(text);

  const fetchStorePickup = () => {
    setStorePickUpLoading(true);
    searchClinicApi()
      .then((data) => {
        setStorePickUpLoading(false);
        aphConsole.log('clinic response', data.data.data, data);
        setClinics && setClinics(data.data.data);
      })
      .catch((e) => {
        setStorePickUpLoading(false);
      });
  };

  const filterClinics = (key: string, isId?: boolean) => {
    if (isId) {
      const data = clinics.filter((item) => item.CentreCode === key);
      aphConsole.log('iid filer=', data);
      setPinCode && setPinCode(pinCode);
      setClinicDetails(data);
    } else {
      if (isValidPinCode(key)) {
        setPinCode && setPinCode(key);
        if (key.length == 6) {
          setStorePickUpLoading(true);
          getPlaceInfoByPincode(key)
            .then((data) => {
              aphConsole.log('locaion data', data);
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
              aphConsole.log('cityName data', filterArray);

              setClinicDetails(filterArray || []);
            })
            .catch(() => {
              setClinicDetails([]);
            })
            .finally(() => {
              setStorePickUpLoading(false);
            });
        }
      }
    }
  };

  const renderStorePickup = () => {
    const selectedStoreIndex =
      clinicDetails && clinicDetails.findIndex(({ CentreCode }) => CentreCode == clinicId);
    const storesLength = clinicDetails && clinicDetails.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength! - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const slicedStoreList = [...clinicDetails!].slice(startIndex, startIndex! + 2);

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
        {!storePickUpLoading && pinCode.length == 6 && clinicDetails!.length == 0 && (
          <Text
            style={{
              paddingTop: 10,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            {(currentPatient && currentPatient.firstName) || 'Hi'}, our diagnostic services are only
            available in Chennai and Hyderabad for now. Kindly enter a pin code for Chennai or
            Hyderabad to proceed.
          </Text>
        )}

        {slicedStoreList.map((item, index) => (
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
            hideSeparator={index == clinicDetails!.length - 1}
          />
        ))}
        <View>
          {clinicDetails!.length > 2 && (
            <Text
              style={{ ...styles.yellowTextStyle, textAlign: 'right' }}
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
          <Text style={styles.dateTextStyle}>{selectedTimeSlot ? selectedTimeSlot : ''}</Text>
        </View>
        <Text
          style={[styles.yellowTextStyle, { padding: 0, paddingTop: 20, alignSelf: 'flex-end' }]}
          onPress={() => {
            timeArray ? setDisplaySchedule(true) : null;
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
            onChange={(selectedTab: string) => {
              setselectedTab(selectedTab);
              // setClinicId!('');
              // setDeliveryAddressId!('');
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
        {/* <TouchableOpacity
          activeOpacity={1}
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 4,
            flexDirection: 'row',
            height: 56,
            paddingHorizontal: 16,
            alignItems: 'center',
          }}
          onPress={() => props.navigation.navigate(AppRoutes.ApplyCouponScene, { isTest: true })}
        >
          <CouponIcon />
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
            }}
          >
            {!coupon ? 'Apply Coupon' : `${coupon.code} Applied`}
          </Text>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <ArrowRight />
          </View>
        </TouchableOpacity> */}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            // marginTop: 4,
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
          {/* <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>Collection Charges</Text>
            <Text style={styles.blueTextStyle}>Rs. {deliveryCharges.toFixed(2)}</Text>
          </View> */}
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

  const medicineSuggestions = [
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
    {
      name: 'Metformin 500mg',
      requirePrescription: false,
      cost: 'Rs. 120',
    },
  ];

  const renderMedicineItem = (
    item: { name: string; cost: string },
    index: number,
    length: number
  ) => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardViewStyle,
          shadowRadius: 4,
          marginBottom: 20,
          marginTop: 11,
          marginHorizontal: 6,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <TestsIcon />
        <Text style={[styles.blueTextStyle, { paddingTop: 4 }]}>{item.name}</Text>
        <View style={[styles.separatorStyle, { marginTop: 3, marginBottom: 5 }]} />
        <Text style={styles.medicineCostStyle}>{item.cost}</Text>
      </View>
    );
  };

  const renderTestSuggestions = () => {
    return (
      <View
        style={{
          ...theme.viewStyles.cardContainer,
          paddingTop: 16,
          marginTop: 12,
        }}
      >
        {renderLabel('YOU SHOULD ALSO ADD')}

        <FlatList
          contentContainerStyle={{
            marginHorizontal: 14,
            paddingRight: 28,
          }}
          horizontal={true}
          bounces={false}
          data={medicineSuggestions}
          renderItem={({ item, index }) =>
            renderMedicineItem(item, index, medicineSuggestions.length)
          }
          keyExtractor={(_, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
        />
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
        client.mutate<uploadFile, uploadFileVariables>({
          mutation: UPLOAD_FILE,
          fetchPolicy: 'no-cache',
          variables: {
            fileType: item.fileType,
            base64FileInput: item.base64,
          },
        })
      )
    );
  };

  const onPressProceedToPay = () => {
    const prescriptions = physicalPrescriptions;
    if (prescriptions.length == 0) {
      props.navigation.navigate(AppRoutes.TestsCheckoutScene);
    } else {
      setLoading!(true);
      const unUploadedPres = prescriptions.filter((item) => !item.uploadedUrl);
      multiplePhysicalPrescriptionUpload(unUploadedPres)
        .then((data) => {
          setLoading!(false);
          const uploadUrls = data.map((item) => item.data!.uploadFile.filePath);
          const newuploadedPrescriptions = unUploadedPres.map(
            (item, index) =>
              ({
                ...item,
                uploadedUrl: uploadUrls[index],
              } as PhysicalPrescription)
          );
          setPhysicalPrescriptions &&
            setPhysicalPrescriptions([
              ...newuploadedPrescriptions,
              ...prescriptions.filter((item) => item.uploadedUrl),
            ]);
          setLoading!(false);
          props.navigation.navigate(AppRoutes.TestsCheckoutScene);
        })
        .catch((e) => {
          aphConsole.log({ e });
          setLoading!(false);
          showAphAlert!({
            title: 'Uh oh.. :(',
            description: 'Error occurred while uploading prescriptions.',
          });
        });
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
          {/* {renderProfilePicker()} */}
          <ProfileList
            defaultText={'Select who are these tests for'}
            saveUserChange={true}
            selectedProfile={profile}
            setDisplayAddProfile={(val) => setDisplayAddProfile(val)}
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

  return (
    <View style={{ flex: 1 }}>
      {displaySchedule && (
        <ScheduleCalander
          date={date}
          setDate={(date) => setDate(date)}
          setdisplayoverlay={setDisplaySchedule}
          selectedTimeSlot={selectedTimeSlot}
          setselectedTimeSlot={(selected) => setselectedTimeSlot(selected)}
          isDropDown={true}
          dropdownArray={timeArray}
          CALENDAR_TYPE={CALENDAR_TYPE.WEEK}
        />
      )}
      {displayAddProfile && (
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile);
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
            {/* {renderTestSuggestions()} */}
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
