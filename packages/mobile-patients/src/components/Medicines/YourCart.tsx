import {
  aphConsole,
  formatAddress,
  handleGraphQlError,
  postWebEngageEvent,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
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
import { MedicineIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { MedicineCard } from '@aph/mobile-patients/src/components/ui/MedicineCard';
import { StickyBottomComponent } from '@aph/mobile-patients/src/components/ui/StickyBottomComponent';
import { TabsComponent } from '@aph/mobile-patients/src/components/ui/TabsComponent';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonLogEvent,
  CommonBugFender,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { UPLOAD_DOCUMENT } from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import {
  getDeliveryTime,
  getPlaceInfoByLatLng,
  pinCodeServiceabilityApi,
  searchPickupStoresApi,
  Store,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import Axios from 'axios';
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
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import Geolocation from '@react-native-community/geolocation';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

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
    paddingBottom: 7,
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
  deliveryContainerStyle: {
    backgroundColor: colors.CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 11.5,
    marginBottom: 16,
    borderRadius: 5,
  },
  deliveryStyle: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
  deliveryTimeStyle: {
    ...theme.fonts.IBMPlexSansBold(14),
    color: theme.colors.SHERPA_BLUE,
    lineHeight: 24,
  },
});

export interface YourCartProps extends NavigationScreenProps {
  isComingFromConsult: boolean;
}
{
}

export const YourCart: React.FC<YourCartProps> = (props) => {
  const {
    updateCartItem,
    removeCartItem,
    cartItems,
    addresses,
    setDeliveryAddressId,
    deliveryAddressId,
    storeId,
    setStoreId,
    deliveryCharges,
    cartTotal,
    cartTotalOfRxProducts,
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
    deliveryType,
  } = useShoppingCart();

  const tabs = [{ title: 'Home Delivery' }, { title: 'Store Pick Up' }];
  const [selectedTab, setselectedTab] = useState<string>(storeId ? tabs[1].title : tabs[0].title);
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, setLoading } = useUIElements();
  const [isPhysicalUploadComplete, setisPhysicalUploadComplete] = useState<boolean>();
  const [isEPrescriptionUploadComplete, setisEPrescriptionUploadComplete] = useState<boolean>();
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [deliveryError, setdeliveryError] = useState<string>('');
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(true);
  const { locationDetails } = useAppCommonData();

  useEffect(() => {
    if (cartItems.length) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.CART_VIEWED] = {
        'Total items in cart': cartItems.length,
        'Sub Total': cartTotal,
        'Delivery charge': deliveryCharges,
        'Coupon code used': coupon ? coupon.code : '',
        'Total Discount': couponDiscount,
        'Net after discount': grandTotal,
        'Prescription Needed?': uploadPrescriptionRequired,
        'Cart Items': cartItems.map(
          (item) =>
            ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              specialPrice: item.specialPrice,
            } as ShoppingCartItem)
        ),
        'Service Area': 'Pharmacy',
        // 'Cart ID': '', // since we don't have cartId before placing order
      };
      postWebEngageEvent(WebEngageEventName.CART_VIEWED, eventAttributes);
    }
  }, []);

  useEffect(() => {
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
                    addrComponents.find((item: any) => item.types.indexOf('postal_code') > -1) || {}
                  ).long_name;
                  !pinCode && fetchStorePickup(_pincode || '');
                }
              } catch (e) {
                CommonBugFender('YourCart_getPlaceInfoByLatLng_try', e);
              }
            })
            .catch((error) => {
              CommonBugFender('YourCart_getPlaceInfoByLatLng', error);
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
      !pinCode && fetchStorePickup(locationDetails.pincode);
    }
  }, []);

  useEffect(() => {
    if (deliveryAddressId && addresses) {
      const selectedAddressIndex = addresses.findIndex(
        (address) => address.id == deliveryAddressId
      );
      addresses &&
        pinCodeServiceabilityApi(addresses[selectedAddressIndex].zipcode!)
          .then(({ data: { Availability } }) => {
            setCheckingServicability(false);
            if (Availability) {
              setDeliveryAddressId && setDeliveryAddressId(deliveryAddressId);
            } else {
              setDeliveryAddressId && setDeliveryAddressId('');
              showAphAlert!({
                title: 'Uh oh.. :(',
                description:
                  'Sorry! We’re working hard to get to this area! In the meantime, you can either pick up from a nearby store, or change the pincode.',
              });
            }
          })
          .catch((e) => {
            CommonBugFender('YourCart_pinCodeServiceabilityApi', e);
            aphConsole.log({ e });
            setCheckingServicability(false);
            handleGraphQlError(e);
          });
    }
  }, []);

  // useEffect(() => {
  //   setLoading!(true);
  //   (currentPatient &&
  //     addresses.length == 0 &&
  //     client
  //       .query<getPatientAddressList, getPatientAddressListVariables>({
  //         query: GET_PATIENT_ADDRESS_LIST,
  //         variables: { patientId: currentPatientId },
  //         fetchPolicy: 'no-cache',
  //       })
  //       .then(({ data: { getPatientAddressList: { addressList } } }) => {
  //         setLoading!(false);
  //         setAddresses && setAddresses(addressList!);
  //       })
  //       .catch((e) => {
  //         setLoading!(false);
  //         showAphAlert!({
  //           title: `Uh oh.. :(`,
  //           description: `Something went wrong, unable to fetch addresses.`,
  //         });
  //       })) ||
  //     setLoading!(false);
  // }, [currentPatient]);

  useEffect(() => {
    onFinishUpload();
  }, [isEPrescriptionUploadComplete, isPhysicalUploadComplete]);

  useEffect(() => {
    if (deliveryAddressId && cartItems.length > 0) {
      const selectedAddress = addresses.find((address) => address.id == deliveryAddressId);
      setdeliveryTime('...');
      setshowDeliverySpinner(true);
      const lookUp = cartItems.map((item) => {
        return { sku: item.id, qty: item.quantity };
      });
      if (selectedAddress) {
        getDeliveryTime({
          postalcode: selectedAddress.zipcode || '',
          ordertype: 'pharma',
          lookup: lookUp,
        })
          .then((res) => {
            setdeliveryTime('');
            try {
              console.log('resresres', res);
              if (res && res.data) {
                if (
                  typeof res.data === 'object' &&
                  Array.isArray(res.data.tat) &&
                  res.data.tat.length
                ) {
                  let tatItems = res.data.tat;
                  tatItems.sort(({ deliverydate: item1 }, { deliverydate: item2 }) => {
                    return moment(item1, 'D-MMM-YYYY HH:mm a') > moment(item2, 'D-MMM-YYYY HH:mm a')
                      ? -1
                      : moment(item1, 'D-MMM-YYYY HH:mm a') < moment(item2, 'D-MMM-YYYY HH:mm a')
                      ? 1
                      : 0;
                  });
                  setdeliveryTime(
                    moment(tatItems[0].deliverydate, 'D-MMM-YYYY HH:mm a').toString()
                  );
                } else if (typeof res.data === 'string') {
                  setdeliveryError(res.data);
                } else if (typeof res.data.errorMSG === 'string') {
                  setdeliveryError(res.data.errorMSG);
                }
              }
            } catch (error) {
              CommonBugFender('YourCart_getDeliveryTime_try', error);
              console.log(error);
            }
            setshowDeliverySpinner(false);
          })
          .catch((err) => {
            CommonBugFender('YourCart_getDeliveryTime', err);
            if (!Axios.isCancel(err)) {
              setdeliveryTime('');
              showAphAlert &&
                showAphAlert({
                  title: 'Uh oh.. :(',
                  description: 'Something went wrong, Unable to fetch delivery time',
                });
              setshowDeliverySpinner(false);
            }
          });
      }
    }
  }, [deliveryAddressId, cartItems]);

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
        title={'MEDICINES CART'}
        rightComponent={
          <View>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (props.navigation.getParam('isComingFromConsult'))
                  props.navigation.navigate(AppRoutes.SearchMedicineScene);
                else {
                  CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
                  props.navigation.goBack();
                }
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
        onPressLeftIcon={() => {
          CommonLogEvent(AppRoutes.YourCart, 'Go back to add items');
          props.navigation.goBack();
        }}
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

  const postwebEngageProductClickedEvent = ({ name, id }: ShoppingCartItem) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
      'product name': name,
      'product id': id,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': '',
      Source: 'List',
      'Section Name': 'CART',
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, eventAttributes);
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
          const imageUrl = medicine.prescriptionRequired
            ? ''
            : medicine.thumbnail && !medicine.thumbnail.includes('/default/placeholder')
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
                postwebEngageProductClickedEvent(medicine);
                CommonLogEvent(AppRoutes.YourCart, 'Navigate to medicine details scene');
                props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
                  sku: medicine.id,
                  title: medicine.name,
                });
              }}
              medicineName={medicine.name}
              price={medicine.price}
              specialPrice={medicine.specialPrice}
              unit={medicine.quantity}
              imageUrl={imageUrl}
              onPressAdd={() => {}}
              onPressRemove={() => {
                CommonLogEvent(AppRoutes.YourCart, 'Remove item from cart');
                onRemoveCartItem(medicine);
              }}
              onChangeUnit={(unit) => {
                CommonLogEvent(AppRoutes.YourCart, 'Change unit in cart');
                onUpdateCartItem(medicine, unit);
              }}
              isCardExpanded={true}
              isInStock={medicine.isInStock}
              showRemoveWhenOutOfStock={!medicine.isInStock}
              isPrescriptionRequired={medicine.prescriptionRequired}
              subscriptionStatus={'unsubscribed'}
              packOfCount={parseInt(medicine.mou || '0')}
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

  const checkServicability = (address: savePatientAddress_savePatientAddress_patientAddress) => {
    setdeliveryTime('');
    setdeliveryError('');
    setshowDeliverySpinner(false);
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
        CommonBugFender('YourCart_checkServicability', e);
        aphConsole.log({ e });
        setCheckingServicability(false);
        handleGraphQlError(e);
      });
  };

  const renderHomeDelivery = () => {
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
        {slicedAddressList.map((item, index, array) => {
          return (
            <RadioSelectionItem
              key={item.id}
              title={formatAddress(item)}
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
            onPress={() => {
              CommonLogEvent(AppRoutes.YourCart, 'Add new address');
              props.navigation.navigate(AppRoutes.AddAddress);
            }}
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
        {deliveryTime || deliveryError ? (
          <View>
            <View style={styles.separatorStyle} />
            <View style={styles.deliveryContainerStyle}>
              {showDeliverySpinner ? (
                <ActivityIndicator animating={true} size={'small'} color="green" />
              ) : (
                <View style={styles.rowSpaceBetweenStyle}>
                  <Text style={styles.deliveryStyle}>{deliveryTime && 'Delivery Time'}</Text>
                  <Text style={styles.deliveryTimeStyle}>
                    {moment(deliveryTime).isValid()
                      ? moment(deliveryTime).format('D MMM YYYY  | hh:mm A')
                      : '...' || deliveryError}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={{ height: 9 }} />
        )}
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
            setSlicedStoreList(stores_count > 0 ? Stores.slice(0, 2) : []);
            setStoreId && setStoreId('');
          })
          .catch((e) => {
            CommonBugFender('YourCart_fetchStorePickup', e);
            setStorePickUpLoading(false);
          });
      } else {
        setStores && setStores([]);
        setStoreId && setStoreId('');
      }
    }
  };

  const [slicedStoreList, setSlicedStoreList] = useState<Store[]>([]);
  const [slicedAddressList, setSlicedAddressList] = useState<
    savePatientAddress_savePatientAddress_patientAddress[]
  >([]);

  const updateStoreSelection = () => {
    const selectedStoreIndex = stores.findIndex(({ storeid }) => storeid == storeId);
    const storesLength = stores.length;
    const spliceStartIndex =
      selectedStoreIndex == storesLength - 1 ? selectedStoreIndex - 1 : selectedStoreIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const _slicedStoreList = [...stores].slice(startIndex, startIndex + 2);
    setSlicedStoreList(_slicedStoreList);
  };

  const updateAddressSelection = () => {
    const selectedAddressIndex = addresses.findIndex((address) => address.id == deliveryAddressId);
    const addressListLength = addresses.length;
    const spliceStartIndex =
      selectedAddressIndex == addressListLength - 1
        ? selectedAddressIndex - 1
        : selectedAddressIndex;
    const startIndex = spliceStartIndex == -1 ? 0 : spliceStartIndex;
    const _slicedAddressList = [...addresses].slice(startIndex, startIndex + 2);
    setSlicedAddressList(_slicedAddressList);
  };

  useEffect(() => {
    const _didFocusSubscription = props.navigation.addListener('didFocus', () => {
      updateStoreSelection();
      updateAddressSelection();
    });
    const _willBlurSubscription = props.navigation.addListener('willBlur', () => {
      updateStoreSelection();
      updateAddressSelection();
    });
    return () => {
      _didFocusSubscription && _didFocusSubscription.remove();
      _willBlurSubscription && _willBlurSubscription.remove();
    };
  }, [stores, storeId, addresses, deliveryAddressId]);

  useEffect(() => {
    pinCode.length !== 6 && setSlicedStoreList([]);
  }, [pinCode]);

  const renderStorePickup = () => {
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

  const renderDelivery = () => {
    return (
      <View>
        {renderLabel('WHERE SHOULD WE DELIVER?')}
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
              setStoreId!('');
              setDeliveryAddressId!('');
              // delivery time related
              setdeliveryTime('');
              setdeliveryError('');
              setshowDeliverySpinner(false);
            }}
            selectedTab={selectedTab}
          />
          {selectedTab === tabs[0].title ? renderHomeDelivery() : renderStorePickup()}
        </View>
      </View>
    );
  };

  const renderTotalCharges = () => {
    return (
      <View>
        {renderLabel('TOTAL CHARGES')}
        {/* <ListCard
          container={{ marginTop: 16, marginBottom: 4 }}
          leftIcon={<CouponIcon />}
          rightIcon={<ArrowRight />}
          title={!coupon ? 'Apply Coupon' : `${coupon.code} Applied`}
          onPress={() => {
            cartTotalOfRxProducts > 0
              ? props.navigation.navigate(AppRoutes.ApplyCouponScene)
              : showAphAlert!({
                  title: 'Uh oh.. :(',
                  description:
                    'Coupon is applicable only on Rx medicines. To apply coupon add atleast one Rx medicine to cart.',
                });
          }}
        /> */}
        <View
          style={{
            ...theme.viewStyles.cardViewStyle,
            marginHorizontal: 20,
            marginTop: 16,
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

  /*
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
  */

  const disableProceedToPay = !(
    cartItems.length > 0 &&
    !showDeliverySpinner &&
    !cartItems.find((item) => !item.isInStock) &&
    !!(deliveryAddressId || storeId) &&
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
          //For previous code refer build previous to DEV_10.0.62
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
          CommonBugFender('YourCart_physicalPrescriptionUpload', e);
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
    console.log(
      physicalPrescriptions,
      ePrescriptions,
      isEPrescriptionUploadComplete,
      isPhysicalUploadComplete,
      'hhruso'
    );

    if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length == 0 &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      props.navigation.navigate(AppRoutes.CheckoutScene, { deliveryTime });
    } else if (
      physicalPrescriptions.length == 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete
    ) {
      setLoading!(false);
      setisEPrescriptionUploadComplete(false);
      props.navigation.navigate(AppRoutes.CheckoutScene, { deliveryTime });
    } else if (
      physicalPrescriptions.length > 0 &&
      ePrescriptions.length > 0 &&
      isEPrescriptionUploadComplete &&
      isPhysicalUploadComplete
    ) {
      setLoading!(false);
      setisPhysicalUploadComplete(false);
      setisEPrescriptionUploadComplete(false);
      props.navigation.navigate(AppRoutes.CheckoutScene, { deliveryTime });
    }
  };

  const postwebEngageProceedToPayEvent = () => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PROCCED_TO_PAY_CLICKED] = {
      'Total items in cart': cartItems.length,
      'Sub Total': cartTotal,
      'Delivery charge': deliveryCharges,
      'Net after discount': grandTotal,
      'Prescription Needed?': uploadPrescriptionRequired,
      // 'Cart ID': '', // since we don't have cartId before placing order
      'Mode of Delivery': selectedTab === tabs[0].title ? 'Home' : 'Pickup',
      'Delivery Date Time':
        selectedTab === tabs[0].title && moment(deliveryTime).isValid ? deliveryTime : undefined, // Optional (only if Home)
      'Pin Code': pinCode,
      'Service Area': 'Pharmacy',
    };
    postWebEngageEvent(WebEngageEventName.PROCCED_TO_PAY_CLICKED, eventAttributes);
  };

  const onPressProceedToPay = () => {
    postwebEngageProceedToPayEvent();
    const prescriptions = physicalPrescriptions;
    if (prescriptions.length == 0 && ePrescriptions.length == 0) {
      props.navigation.navigate(AppRoutes.CheckoutScene, { deliveryTime });
    } else {
      if (prescriptions.length > 0) {
        physicalPrescriptionUpload();
      }
      if (ePrescriptions.length > 0) {
        ePrescriptionUpload();
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...theme.viewStyles.container }}>
        {renderHeader()}
        <ScrollView bounces={false}>
          <View style={{ marginVertical: 24 }}>
            {renderItemsInCart()}
            <MedicineUploadPrescriptionView navigation={props.navigation} />
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
            onPress={() => {
              CommonLogEvent(AppRoutes.YourCart, 'PROCEED TO PAY');
              onPressProceedToPay();
            }}
            style={{ flex: 1, marginHorizontal: 40 }}
          />
        </StickyBottomComponent>
      </SafeAreaView>
    </View>
  );
};
