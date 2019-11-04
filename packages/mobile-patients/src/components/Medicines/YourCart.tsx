import {
  uploadFile,
  uploadFileVariables,
} from '@aph/mobile-patients/src//graphql/types/uploadFile';
import { aphConsole, handleGraphQlError, timeTo12HrFormat } from '@aph/mobile-patients/src//helpers/helperFunctions';
import { MedicineUploadPrescriptionView } from '@aph/mobile-patients/src/components/Medicines/MedicineUploadPrescriptionView';
import { RadioSelectionItem } from '@aph/mobile-patients/src/components/Medicines/RadioSelectionItem';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  PhysicalPrescription,
  ShoppingCartItem,
  useShoppingCart,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { ArrowRight, CouponIcon, MedicineIcon, CalendarShow, DropdownGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { GET_PATIENT_ADDRESS_LIST, UPLOAD_FILE } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  pinCodeServiceabilityApi,
  searchPickupStoresApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { FlatList, NavigationScreenProps, ScrollView } from 'react-navigation';
import { CommonLogEvent } from '../../FunctionHelpers/DeviceHelper';
import moment from 'moment';
import { ScheduleCalander } from '@aph/mobile-patients/src/components/ui/ScheduleCalander';
import { AddProfile } from '@aph/mobile-patients/src/components/ui/AddProfile';
import { CALENDAR_TYPE } from '@aph/mobile-patients/src/components/ui/CalendarView';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';

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
  dateTextStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
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
  week: string,
  time: string
};

type TimeArray = {
  label: string;
  time: string[];
}[];

type Profile = {
  pid: string;
  name: string;
};

export interface YourCartProps extends NavigationScreenProps {
  isComingFromConsult: boolean;
  isTestCart?: boolean;
}
{
}

export const YourCart: React.FC<YourCartProps> = (props) => {
  const {
    updateCartItem,
    removeCartItem,
    cartItems,
    setAddresses,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    storeId,
    setStoreId,
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
    stores,
    setStores,
    ePrescriptions,
  } = useShoppingCart();
  const isTestCart = props.navigation.getParam('isTestCart');

  const { width, height } = Dimensions.get('window');
  const tabs = isTestCart ? [{ title: 'Home Visit', subtitle: 'Appointment Slot' }, { title: 'Clinic Visit', subtitle: 'Clinic Hours' }] : [{ title: 'Home Delivery', subtitle: '' }, { title: 'Store Pick Up', subtitle: '' }];
  const clinicHours: clinicHoursData[] = [
    {
      week: 'Mon - Fri',
      time: '9:00 AM - 5:00 PM'
    },
    {
      week: 'Sat - Sun',
      time: '10:00 AM - 3:30 PM'
    },
  ];

  const [profile, setProfile] = useState<Profile>({ pid: '', name: '' });
  const [displayAddProfile, setDisplayAddProfile] = useState<boolean>(false);
  const [displaySchedule, setDisplaySchedule] = useState<boolean>(false);
  const [date, setDate] = useState<Date>(new Date());
  const [timeArray, settimeArray] = useState<TimeArray>([]);
  const [selectedTimeSlot, setselectedTimeSlot] = useState<string>('');
  const [profileArray, setProfileArray] = useState<Profile[]>([]);

  const [selectedTab, setselectedTab] = useState<string>(storeId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const currentPatientId = currentPatient && currentPatient!.id;
  const client = useApolloClient();
  const { showAphAlert, setLoading } = useUIElements();
  const { getPatientApiCall } = useAuth();

  const addNewProfileText = (data: Profile[], newEntry?: Profile) => {
    let pArray = data;
    if (newEntry) {
      pArray.pop();
      pArray.push(newEntry)
    }
    pArray.push({ pid: 'ADD NEW PROFILE', name: 'ADD NEW PROFILE' });
    return pArray
  }

  useEffect(() => {
    if (!currentPatient) {
      getPatientApiCall();
    }
  }, [currentPatient]);

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

  useEffect(() => {
    setProfileArray(addNewProfileText(profileArray));
  }, [profileArray]);


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

  const onUpdateCartItem = ({ id }: ShoppingCartItem, unit: number) => {
    if (!(unit < 1)) {
      updateCartItem && updateCartItem({ id, quantity: unit });
    }
  };

  const onRemoveCartItem = ({ id }: ShoppingCartItem) => {
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
        title={isTestCart ? 'TESTS CART' : 'YOUR CART'}
        titleStyle={{ marginLeft: isTestCart ? 20 : 0 }}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (props.navigation.getParam('isComingFromConsult'))
                  props.navigation.navigate(AppRoutes.SearchMedicineScene);
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
        {cartItems.map((medicine, index, array) => {
          const medicineCardContainerStyle = [
            { marginBottom: 8, marginHorizontal: 20 },
            index == 0 ? { marginTop: 20 } : {},
            index == array.length - 1 ? { marginBottom: 20 } : {},
          ];
          const imageUrl =
            medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
              ? medicine.thumbnail.startsWith('http')
                ? medicine.thumbnail
                : `${AppConfig.Configuration.IMAGES_BASE_URL}${medicine.thumbnail}`
              : '';

          return (
            <MedicineCard
              // personName={
              //   currentPatient && currentPatient.firstName ? currentPatient.firstName : ''
              // }
              containerStyle={medicineCardContainerStyle}
              key={medicine.id}
              onPress={() => {
                CommonLogEvent(AppRoutes.YourCart, 'Navigate to medicine details scene');
                props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
                  sku: medicine.id,
                  title: medicine.name,
                });
              }}
              medicineName={medicine.name!}
              // originalPrice={10}
              price={medicine.price!}
              unit={medicine.quantity}
              imageUrl={imageUrl}
              onPressAdd={() => { }}
              onPressRemove={() => {
                CommonLogEvent(AppRoutes.YourCart, 'Remove item from cart');
                onRemoveCartItem(medicine);
              }}
              onChangeUnit={(unit) => {
                CommonLogEvent(AppRoutes.YourCart, 'Change unit in cart');
                onUpdateCartItem(medicine, unit);
              }}
              isCardExpanded={true}
              isInStock={true}
              isTest={isTestCart}
              isPrescriptionRequired={medicine.prescriptionRequired}
              subscriptionStatus={'unsubscribed'}
              packOfCount={parseInt(medicine.mou || '0')}
              onChangeSubscription={() => { }}
              onEditPress={() => { }}
              onAddSubscriptionPress={() => { }}
            />
          );
        })}
      </View>
    );
  };

  const [checkingServicability, setCheckingServicability] = useState(false);

  const checkServicability = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setCheckingServicability(true);
    pinCodeServiceabilityApi(address.zipcode!)
      .then(({ data: { Availability } }) => {
        setCheckingServicability(false);
        if (Availability) {
          setDeliveryAddressId && setDeliveryAddressId(address.id);
        } else {
          showAphAlert!({
            title: 'Uh oh.. :(',
            description:
              'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.',
          });
        }
      })
      .catch((e) => {
        aphConsole.log({ e });
        setCheckingServicability(false);
        handleGraphQlError(e);
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
                CommonLogEvent(AppRoutes.YourCart, 'Check service availability');
                checkServicability(item);
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
                onPress={() => props.navigation.navigate(AppRoutes.SelectDeliveryAddress)}
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

  const fetchStorePickup = (pincode: string) => {
    if (isValidPinCode(pincode)) {
      setPinCode && setPinCode(pincode);
      if (pincode.length == 6) {
        setStorePickUpLoading(true);
        searchPickupStoresApi(pincode)
          .then(({ data: { Stores, stores_count } }) => {
            setStorePickUpLoading(false);
            setStores && setStores(stores_count > 0 ? Stores : []);
          })
          .catch((e) => {
            setStorePickUpLoading(false);
          });
      } else {
        setStores && setStores([]);
        setStoreId && setStoreId('');
      }
    }
  };

  const renderStorePickup = () => {
    const selectedStoreIndex = stores.findIndex(({ storeid }) => storeid == storeId);
    const storesLength = stores.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const slicedStoreList = [...stores].slice(startIndex, startIndex + 2);

    return (
      <View style={{ margin: 16, marginTop: 20 }}>
        <TextInputComponent
          value={`${pinCode}`}
          maxLength={6}
          onChangeText={(pincode) => fetchStorePickup(pincode)}
          placeholder={'Enter Pincode'}
        />
        {storePickUpLoading && <ActivityIndicator color="green" size="large" />}
        {!storePickUpLoading && pinCode.length == 6 && stores.length == 0 && (
          <Text
            style={{
              paddingTop: 10,
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              color: '#0087ba',
            }}
          >
            Sorry! We’re working hard to get to this area! In the meantime, you can either pick up
            from a nearby store, or change the pincode.
          </Text>
        )}

        {slicedStoreList.map((store, index, array) => (
          <RadioSelectionItem
            key={store.storeid}
            title={`${store.storename}\n${store.address}`}
            isSelected={storeId === store.storeid}
            onPress={() => {
              CommonLogEvent(AppRoutes.YourCart, 'Set store id');
              setStoreId && setStoreId(store.storeid);
            }}
            containerStyle={{ marginTop: 16 }}
            hideSeparator={index == array.length - 1}
          />
        ))}
        <View>
          {stores.length > 2 && (
            <Text
              style={{ ...styles.yellowTextStyle, textAlign: 'right' }}
              onPress={() =>
                props.navigation.navigate(AppRoutes.StorPickupScene, {
                  pincode: pinCode,
                  stores: stores,
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
          <Text style={styles.dateTextStyle}>{moment(date).format('DD MMM, YYYY')}</Text>
        </View>
        <View style={styles.rowSpaceBetweenStyle}>
          <Text style={styles.dateTextStyle}>Time</Text>
          <Text style={styles.dateTextStyle}>{timeTo12HrFormat(selectedTimeSlot)}</Text>
        </View>
        <Text
          style={[styles.yellowTextStyle, { padding: 0, paddingTop: 20, alignSelf: 'flex-end' }]}
          onPress={() => { setDisplaySchedule(true) }}
        >
          PICK ANOTHER SLOT
              </Text>
      </View>
    )
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
          )
        })}
      </View>
    )
  };

  const renderTimingCard = () => {
    return (
      selectedTab === tabs[0].title && deliveryAddressId || selectedTab === tabs[1].title ?
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
            <Text style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              color: theme.colors.SHERPA_BLUE,
              lineHeight: 24,
              paddingLeft: 16,
            }}
            >{selectedTab === tabs[0].title ? tabs[0].subtitle : tabs[1].subtitle}</Text>
          </View>
          <View style={[styles.separatorStyle, { marginTop: 10, marginBottom: 12.5 }]} />
          {selectedTab === tabs[0].title ? renderPickupHours() : renderClinicHours()}
        </View>
        :
        <View style={{ padding: 12 }}></View>
    )
  }

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel(isTestCart ? 'WHERE TO COLLECT SAMPLE FROM?' : 'WHERE SHOULD WE DELIVER?')}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
            marginBottom: 24,
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
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
        {isTestCart && renderTimingCard()}
      </View>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        <TouchableOpacity
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
          onPress={() => props.navigation.navigate(AppRoutes.ApplyCouponScene)}
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
        </TouchableOpacity>
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 4,
            marginBottom: 12,
            padding: 16,
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
          <View style={styles.rowSpaceBetweenStyle}>
            <Text style={styles.blueTextStyle}>Delivery Charges</Text>
            <Text style={styles.blueTextStyle}>+ Rs. {deliveryCharges.toFixed(2)}</Text>
          </View>
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
        <MedicineIcon />
        <Text style={[styles.blueTextStyle, { paddingTop: 4 }]}>{item.name}</Text>
        <View style={[styles.separatorStyle, { marginTop: 3, marginBottom: 5 }]} />
        <Text style={styles.medicineCostStyle}>
          {item.cost} <Text style={{ ...theme.fonts.IBMPlexSansMedium(12) }}>/strip</Text>
        </Text>
      </View>
    );
  };

  const renderMedicineSuggestions = () => {
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
    !!(deliveryAddressId || storeId) &&
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
      props.navigation.navigate(AppRoutes.CheckoutScene);
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
          props.navigation.navigate(AppRoutes.CheckoutScene);
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

  const renderProfilePicker = () => {
    return (
      <MaterialMenu
        dataObject={profileArray}
        selectedText={profile.pid}
        menuContainer={{ alignItems: 'flex-end' }}
        itemContainer={{ height: 44.8, marginHorizontal: 12, width: width / 2 }}
        itemTextStyle={{ ...theme.viewStyles.text('M', 16, '#01475b'), paddingHorizontal: 0 }}
        selectedTextStyle={{
          ...theme.viewStyles.text('M', 16, '#00b38e'),
          alignSelf: 'flex-start'
        }}
        lastTextStyle={{
          ...theme.viewStyles.text('B', 13, '#fc9916')
        }}
        bottomPadding={{ paddingBottom: 20 }}
        lastContainerStyle={{ height: 38, borderBottomWidth: 0, alignItems: 'flex-end', justifyContent: 'flex-end' }}
        onPressObject={(selectedUser) => {
          if (selectedUser.pid === 'ADD NEW PROFILE')
            setDisplayAddProfile(true)
          else
            setProfile(selectedUser)
        }}>
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <View style={styles.placeholderViewStyle}>
            <Text
              style={[
                styles.placeholderTextStyle,
                ,
                profile.pid !== '' ? null : styles.placeholderStyle,
              ]}
            >
              {profile.pid !== '' ? profile.name : 'Select who are these tests for'}
            </Text>
            <View style={[{ flex: 1, alignItems: 'flex-end' }]}>
              <DropdownGreen />
            </View>
          </View>
        </View>
      </MaterialMenu>
    )
  }

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
            paddingBottom: 16
          }}
        >
          {renderProfilePicker()}
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(16),
              lineHeight: 24,
              marginTop: 8,
              color: theme.colors.SKY_BLUE
            }}
          >
            {`All the tests must be for one person. Tests for multiple profiles will require separate purchases.`}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {displaySchedule &&
        <ScheduleCalander
          date={date}
          setDate={(date) => setDate(date)}
          setdisplayoverlay={setDisplaySchedule}
          selectedTimeSlot={selectedTimeSlot}
          setselectedTimeSlot={(selected) => setselectedTimeSlot(selected)}
          timeArray={timeArray}
          CALENDAR_TYPE={CALENDAR_TYPE.WEEK} />
      }
      {displayAddProfile &&
        <AddProfile
          setdisplayoverlay={setDisplayAddProfile}
          setProfile={(profile) => {
            setProfile(profile)
            setProfileArray(addNewProfileText(profileArray, profile))
          }} />
      }
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView bounces={false}>
          <View style={{ marginVertical: 24 }}>
            {renderItemsInCart()}
            {isTestCart && renderProfiles()}
            <MedicineUploadPrescriptionView isTest={isTestCart} navigation={props.navigation} />
            {renderDelivery()}
            {renderTotalCharges()}
            {/* {renderMedicineSuggestions()} */}
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
    </View>
  );
};
