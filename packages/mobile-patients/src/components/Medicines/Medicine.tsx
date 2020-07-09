import {
  useAppCommonData,
  LocationData,
} from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { PincodePopup } from '@aph/mobile-patients/src/components/Medicines/PincodePopup';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import {
  Badge,
  SectionHeader,
  Spearator,
} from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CartIcon,
  DropdownGreen,
  MedicineIcon,
  OfferIcon,
  PrescriptionPad,
  SearchSendIcon,
  HomeIcon,
  OrangeCallIcon,
  ArrowRight,
  ShoppingBasketIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  SAVE_SEARCH,
  GET_RECOMMENDED_PRODUCTS_LIST,
  GET_LATEST_MEDICINE_ORDER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  Brand,
  getMedicinePageProducts,
  getMedicineSearchSuggestionsApi,
  MedicinePageAPiResponse,
  MedicineProduct,
  pinCodeServiceabilityApi,
  MedicinePageSection,
  getNearByStoreDetailsApi,
  callToExotelApi,
  OfferBannerSection,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  doRequestAndAccessLocationModified,
  g,
  isValidSearch,
  postAppsFlyerAddToCartEvent,
  postwebEngageAddToCartEvent,
  postWebEngageEvent,
  addPharmaItemToCart,
  productsThumbnailUrl,
  reOrderMedicines,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { postMyOrdersClicked } from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import AsyncStorage from '@react-native-community/async-storage';
import Axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import {
  Dimensions,
  Image as ImageNative,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  Platform,
} from 'react-native';
import { Image, Input, ListItem } from 'react-native-elements';
import { FlatList, NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';
import { MedicineSearchSuggestionItem } from '@aph/mobile-patients/src/components/Medicines/MedicineSearchSuggestionItem';
import Carousel from 'react-native-snap-carousel';
import {
  getRecommendedProductsList,
  getRecommendedProductsListVariables,
} from '@aph/mobile-patients/src/graphql/types/getRecommendedProductsList';
import {
  getLatestMedicineOrder,
  getLatestMedicineOrderVariables,
  getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails,
} from '@aph/mobile-patients/src/graphql/types/getLatestMedicineOrder';
import {
  MedicineReOrderOverlayProps,
  MedicineReOrderOverlay,
} from '@aph/mobile-patients/src/components/Medicines/MedicineReOrderOverlay';

const styles = StyleSheet.create({
  hiTextStyle: {
    marginLeft: 20,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  nameTextContainerStyle: {
    maxWidth: '65%',
  },
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    //marginTop: 5,
    marginHorizontal: 5,
    marginBottom: 6,
  },
  sliderDotStyle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 9,
  },
  sliderPlaceHolderStyle: {
    ...theme.viewStyles.imagePlaceholderStyle,
    width: '100%',
    alignContent: 'center',
    justifyContent: 'center',
  },
});

export interface MedicineProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
  }> {}

export const Medicine: React.FC<MedicineProps> = (props) => {
  const focusSearch = props.navigation.getParam('focusSearch');
  const {
    locationDetails,
    pharmacyLocation,
    setPharmacyLocation,
    isPharmacyLocationServiceable,
    setPharmacyLocationServiceable,
    medicinePageAPiResponse,
    setMedicinePageAPiResponse,
  } = useAppCommonData();
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [pincodePopupVisible, setPincodePopupVisible] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const config = AppConfig.Configuration;
  const {
    cartItems,
    addCartItem,
    removeCartItem,
    updateCartItem,
    setItemsWithQtyRestriction,
    addMultipleCartItems,
    addMultipleEPrescriptions,
  } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const cartItemsCount = cartItems.length + diagnosticCartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  const [allBrandData, setAllBrandData] = useState<Brand[]>([]);
  const [serviceabilityMsg, setServiceabilityMsg] = useState('');

  const { showAphAlert, hideAphAlert, setLoading: globalLoading } = useUIElements();
  const {
    data: latestMedicineOrderData,
    loading: latestMedicineOrderLoading,
    error: latestMedicineOrderError,
    // refetch: latestMedicineOrderRefetch,
  } = useQuery<getLatestMedicineOrder, getLatestMedicineOrderVariables>(GET_LATEST_MEDICINE_ORDER, {
    variables: { patientUhid: g(currentPatient, 'uhid') || '' },
    fetchPolicy: 'no-cache',
  });
  const latestMedicineOrder =
    latestMedicineOrderLoading || latestMedicineOrderError
      ? null
      : g(latestMedicineOrderData, 'getLatestMedicineOrder', 'medicineOrderDetails');

  const postwebEngageProductClickedEvent = (
    { name, sku, category_id }: MedicineProduct,
    sectionName: string,
    source: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED]['Source']
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_PRODUCT_CLICKED] = {
      'product name': name,
      'product id': sku,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': category_id,
      Source: source,
      'Section Name': sectionName,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_PRODUCT_CLICKED, eventAttributes);
  };

  const postwebEngageCategoryClickedEvent = (
    categoryId: string,
    categoryName: string,
    sectionName: string,
    imageUrl: string
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CATEGORY_CLICKED] = {
      'category name': categoryName,
      'category ID': categoryId,
      'Section Name': sectionName,
      Source: 'Home',
      imageUrl: imageUrl,
    };
    postWebEngageEvent(WebEngageEventName.CATEGORY_CLICKED, eventAttributes);
  };

  const WebEngageEventAutoDetectLocation = (pincode: string, serviceable: boolean) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_AUTO_SELECT_LOCATION_CLICKED] = {
      'Patient UHID': currentPatient.uhid,
      'Mobile Number': currentPatient.mobileNumber,
      'Customer ID': currentPatient.id,
      pincode: pincode,
      Serviceability: serviceable,
    };
    postWebEngageEvent(WebEngageEventName.PHARMACY_AUTO_SELECT_LOCATION_CLICKED, eventAttributes);
  };

  const updateServiceability = (pincode: string) => {
    const onPresChangeAddress = () => {
      hideAphAlert!();
      setPincodePopupVisible(true);
    };

    const CalltheNearestPharmacyEvent = () => {
      let eventAttributes: WebEngageEvents[WebEngageEventName.CALL_THE_NEAREST_PHARMACY] = {
        pincode: pincode,
        'Mobile Number': currentPatient.mobileNumber,
      };
      postWebEngageEvent(WebEngageEventName.CALL_THE_NEAREST_PHARMACY, eventAttributes);
    };

    const onPressCallNearestPharmacy = (pharmacyPhoneNumber: string) => {
      let from = currentPatient.mobileNumber;
      let to = pharmacyPhoneNumber;
      let caller_id = AppConfig.Configuration.EXOTEL_CALLER_ID;
      // const param = `fromPhone=${from}&toPhone=${to}&callerId=${caller_id}`;
      const param = {
        fromPhone: from,
        toPhone: to,
        callerId: caller_id,
      };
      CalltheNearestPharmacyEvent();
      globalLoading!(true);
      callToExotelApi(param)
        .then((response) => {
          hideAphAlert!();
          globalLoading!(false);
          console.log('exotelCallAPI response', response, 'params', param);
        })
        .catch((error) => {
          hideAphAlert!();
          globalLoading!(false);
          showAphAlert!({
            title: string.common.uhOh,
            description: 'We could not connect to the pharmacy now. Please try later.',
          });
          console.log('exotelCallAPI error', error, 'params', param);
        });
    };

    pinCodeServiceabilityApi(pincode)
      .then(({ data: { Availability } }) => {
        setServiceabilityMsg(Availability ? '' : 'Services unavailable. Change delivery location.');
        setPharmacyLocationServiceable!(Availability ? true : false);
        WebEngageEventAutoDetectLocation(pincode, Availability ? true : false);
        if (!Availability) {
          getNearByStoreDetailsApi(pincode)
            .then((response: any) => {
              showAphAlert!({
                title: 'We’ve got you covered !!',
                description:
                  'We are servicing your area through the nearest Pharmacy, Call to Order!',
                titleStyle: theme.viewStyles.text('SB', 18, '#01475b'),
                ctaContainerStyle: { flexDirection: 'column' },
                children: (
                  <View style={{ marginBottom: 15, marginTop: 12, marginHorizontal: 20 }}>
                    <TouchableOpacity
                      activeOpacity={1}
                      style={{
                        backgroundColor: '#fc9916',
                        borderRadius: 5,
                        height: 38,
                        marginBottom: 5,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        flexDirection: 'row',
                        shadowColor: 'rgba(0,0,0,0.2)',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                        paddingLeft: 12,
                      }}
                      onPress={() =>
                        onPressCallNearestPharmacy(
                          response.data && response.data.phoneNumber
                            ? response.data.phoneNumber
                            : ''
                        )
                      }
                    >
                      <OrangeCallIcon style={{ width: 24, height: 24, marginRight: 8 }} />
                      <Text style={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}>
                        {'CALL THE NEAREST PHARMACY'}
                      </Text>
                    </TouchableOpacity>
                    <Button
                      title={'CHANGE THE ADDRESS'}
                      style={{
                        backgroundColor: '#fc9916',
                        borderRadius: 5,
                        height: 38,
                        marginBottom: 5,
                        justifyContent: 'flex-start',
                        shadowColor: 'rgba(0,0,0,0.2)',
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0,
                        shadowRadius: 0,
                        elevation: 0,
                        paddingLeft: 12,
                      }}
                      titleTextStyle={{ ...theme.viewStyles.text('B', 13, '#ffffff', 1, 24, 0) }}
                      onPress={onPresChangeAddress}
                    />
                  </View>
                ),
              });
              console.log('getNearByStoreDetailsApi', response.data.phoneNumber.toString());
            })
            .catch((error) => {
              showAphAlert!({
                title: 'We’re sorry!',
                description:
                  'We are not serviceable in your area. Please change your location or call 1860 500 0101 for Pharmacy stores nearby.',
                titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
                ctaContainerStyle: { justifyContent: 'flex-end' },
                CTAs: [
                  {
                    text: 'CHANGE THE ADDRESS',
                    type: 'orange-link',
                    onPress: onPresChangeAddress,
                  },
                ],
              });
              console.log('getNearByStoreDetailsApi error', error);
            });
        }
      })
      .catch((e) => {
        CommonBugFender('Medicine_pinCodeServiceabilityApi', e);
        setServiceabilityMsg('Sorry, unable to check serviceability.');
      });
  };

  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');

  useEffect(() => {
    if (pharmacyPincode) {
      updateServiceability(pharmacyPincode);
    }
  }, [pharmacyPincode]);

  useEffect(() => {
    fetchMedicinePageProducts();
    fetchRecommendedProducts();
  }, []);

  const [recommendedProducts, setRecommendedProducts] = useState<MedicineProduct[]>([]);
  const [data, setData] = useState<MedicinePageAPiResponse | null>(medicinePageAPiResponse);
  const [loading, setLoading] = useState<boolean>(!medicinePageAPiResponse);
  const [error, setError] = useState<boolean>(false);
  const banners = (g(data, 'mainbanners') || [])
    .filter((banner) => Number(banner.status))
    .filter(
      (banner) =>
        moment() >= moment(banner.start_time, 'YYYY-MM-DD hh:mm:ss') &&
        moment() <= moment(banner.end_time, 'YYYY-MM-DD hh:mm:ss')
    );
  const healthAreas = g(data, 'healthareas') || [];
  const dealsOfTheDay = g(data, 'deals_of_the_day') || [];
  const shopByCategory = g(data, 'shop_by_category') || [];
  const shopByBrand = g(data, 'shop_by_brand') || [];
  const hotSellers = g(data, 'hot_sellers', 'products') || [];
  const hotSellersCategoryId = g(data, 'hot_sellers', 'category_id') || [];
  const monsoonEssentials = g(data, 'monsoon_essentials', 'products') || [];
  const monsoonEssentialsCategoryId = g(data, 'monsoon_essentials', 'category_id') || 0;
  const widget2 = g(data, 'widget_2', 'products') || [];
  const widget2CategoryId = g(data, 'widget_2', 'category_id') || 0;
  const widget3 = g(data, 'widget_3', 'products') || [];
  const widget3CategoryId = g(data, 'widget_3', 'category_id') || 0;

  useEffect(() => {
    if (hotSellers.length) {
      setItemsWithQtyRestriction!(hotSellers.map((v) => v.sku));
    }
  }, [hotSellers]);

  useEffect(() => {
    if (!loading && !banners.length) {
      setBannerLoading(false);
    }
  }, [loading]);

  const getImageUrl = (fileIds: string) => {
    return fileIds
      .split(',')
      .filter((v) => v)
      .map((v) => `/catalog/product${v}`)[0];
  };

  const fetchMedicinePageProducts = async () => {
    if (medicinePageAPiResponse) {
      return;
    }
    try {
      setLoading(true);
      const resonse = (await getMedicinePageProducts()).data;
      setData(resonse);
      setMedicinePageAPiResponse!(resonse);
      setLoading(false);
    } catch (e) {
      setError(e);
      setLoading(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to fetch products right now, please try later.",
      });
      CommonBugFender(`${AppRoutes.Medicine}_fetchMedicinePageProducts`, e);
    }
  };

  const fetchRecommendedProducts = async () => {
    try {
      const recommendedProductsListApi = await client.query<
        getRecommendedProductsList,
        getRecommendedProductsListVariables
      >({
        query: GET_RECOMMENDED_PRODUCTS_LIST,
        variables: { patientUhid: g(currentPatient, 'uhid') || '' },
        fetchPolicy: 'no-cache',
      });
      const _recommendedProducts =
        g(
          recommendedProductsListApi,
          'data',
          'getRecommendedProductsList',
          'recommendedProducts'
        ) || [];
      const formattedRecommendedProducts = _recommendedProducts
        .filter((item) => (item!.status || '').toLowerCase() == 'enabled')
        .map(
          (item) =>
            ({
              image: item!.productImage ? getImageUrl(item!.productImage) : null,
              is_in_stock: 1,
              is_prescription_required: item!.isPrescriptionNeeded!,
              name: item!.productName!,
              price: Number(item!.productPrice!),
              special_price: item!.productSpecialPrice || '',
              sku: item!.productSku!,
              type_id:
                (item!.categoryName || '').toLowerCase().indexOf('pharma') > -1 ? 'Pharma' : 'FMCG',
              mou: item!.mou!,
            } as MedicineProduct)
        );
      formattedRecommendedProducts.length >= 5 &&
        setRecommendedProducts(formattedRecommendedProducts);
    } catch (e) {
      CommonBugFender(`${AppRoutes.Medicine}_fetchRecommendedProducts`, e);
    }
  };

  // Common Views

  const renderSectionLoader = (height: number = 100) => {
    return <Spinner style={{ height, position: 'relative', backgroundColor: 'transparent' }} />;
  };

  const autoDetectLocation = () => {
    globalLoading!(true);
    doRequestAndAccessLocationModified()
      .then((response) => {
        globalLoading!(false);
        response && setPharmacyLocation!(response);
        response && WebEngageEventAutoDetectLocation(response.pincode, true);
      })
      .catch((e) => {
        CommonBugFender('Medicine__ALLOW_AUTO_DETECT', e);
        globalLoading!(false);
        e &&
          typeof e == 'string' &&
          !e.includes('denied') &&
          showAphAlert!({
            title: string.common.uhOh,
            description: e,
          });
      });
  };

  const renderTopView = () => {
    const localStyles = StyleSheet.create({
      headerContainer: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        paddingTop: 16,
        paddingBottom: serviceabilityMsg ? 0 : 10,
        backgroundColor: '#fff',
      },
      menuItemContainer: {
        marginHorizontal: 0,
        padding: 0,
        margin: 0,
      },
      menuMenuContainerStyle: {
        marginLeft: winWidth * 0.25,
        marginTop: 50,
      },
      menuScrollViewContainerStyle: { paddingVertical: 0 },
      menuItemTextStyle: {
        ...theme.viewStyles.text('M', 14, '#01475b'),
        padding: 0,
        margin: 0,
      },
      menuBottomPadding: { paddingBottom: 0 },
      deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 16) },
      locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
      locationTextUnderline: {
        height: 2,
        backgroundColor: '#00b38e',
        opacity: 1,
      },
      dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
      serviceabilityMsg: { ...theme.viewStyles.text('R', 10, '#890000') },
    });

    const renderIcon = () => (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          props.navigation.dispatch(
            StackActions.reset({
              index: 0,
              key: null,
              actions: [NavigationActions.navigate({ routeName: AppRoutes.ConsultRoom })],
            })
          );
        }}
      >
        <HomeIcon style={{ height: 33, width: 33 }} />
      </TouchableOpacity>
    );

    const renderDeliverToLocationMenuAndCTA = () => {
      const options = ['Auto Select Location', 'Enter Delivery Pincode'].map((item) => ({
        key: item,
        value: item,
      }));

      return (
        <MaterialMenu
          options={options}
          itemContainer={localStyles.menuItemContainer}
          menuContainerStyle={localStyles.menuMenuContainerStyle}
          scrollViewContainerStyle={localStyles.menuScrollViewContainerStyle}
          itemTextStyle={localStyles.menuItemTextStyle}
          bottomPadding={localStyles.menuBottomPadding}
          onPress={(item) => {
            if (item.value == options[0].value) {
              autoDetectLocation();
            } else {
              const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_CLICKED] = {
                'Patient UHID': currentPatient.uhid,
                'Mobile Number': currentPatient.mobileNumber,
                'Customer ID': currentPatient.id,
              };
              postWebEngageEvent(
                WebEngageEventName.PHARMACY_ENTER_DELIVERY_PINCODE_CLICKED,
                eventAttributes
              );
              setPincodePopupVisible(true);
            }
          }}
        >
          {renderDeliverToLocationCTA()}
        </MaterialMenu>
      );
    };

    const formatText = (text: string, count: number) =>
      text.length > count ? `${text.slice(0, count)}...` : text;

    const renderDeliverToLocationCTA = () => {
      const location = pharmacyLocation
        ? `${formatText(g(pharmacyLocation, 'city') || g(pharmacyLocation, 'state') || '', 18)} ${g(
            pharmacyLocation,
            'pincode'
          )}`
        : `${formatText(g(locationDetails, 'city') || g(pharmacyLocation, 'state') || '', 18)} ${g(
            locationDetails,
            'pincode'
          )}`;

      return (
        <View style={{ paddingLeft: 15, marginTop: -3.5 }}>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text numberOfLines={1} style={localStyles.deliverToText}>
                Deliver to {formatText(g(currentPatient, 'firstName') || '', 15)}
              </Text>
              <View>
                <Text style={localStyles.locationText}>{location}</Text>
                {!serviceabilityMsg ? (
                  <Spearator style={localStyles.locationTextUnderline} />
                ) : (
                  <View style={{ height: 2 }} />
                )}
              </View>
            </View>
            <View style={localStyles.dropdownGreenContainer}>
              <DropdownGreen />
            </View>
          </View>
          {!!serviceabilityMsg && (
            <Text style={localStyles.serviceabilityMsg}>{serviceabilityMsg}</Text>
          )}
        </View>
      );
    };

    const renderCartIcon = () => (
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ alignItems: 'flex-end' }}
          activeOpacity={1}
          onPress={() =>
            props.navigation.navigate(
              diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.YourCart
            )
          }
        >
          <CartIcon />
          {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={localStyles.headerContainer}>
        {renderIcon()}
        {renderDeliverToLocationMenuAndCTA()}
        {renderCartIcon()}
      </View>
    );
  };

  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
        displayPrismRecords={true}
        navigation={props.navigation}
        onSubmit={(selectedEPres) => {
          setSelectPrescriptionVisible(false);
          if (selectedEPres.length == 0) {
            return;
          }
          props.navigation.navigate(AppRoutes.UploadPrescription, {
            ePrescriptionsProp: selectedEPres,
          });
        }}
        selectedEprescriptionIds={[]}
        isVisible={isSelectPrescriptionVisible}
      />
    );
  };

  const renderUploadPrescriprionPopup = () => {
    return (
      <UploadPrescriprionPopup
        isVisible={ShowPopop}
        disabledOption="NONE"
        type="nonCartFlow"
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
        }}
        onClickClose={() => setShowPopop(false)}
        onResponse={(selectedType, response) => {
          setShowPopop(false);
          if (selectedType == 'CAMERA_AND_GALLERY') {
            if (response.length == 0) return;
            props.navigation.navigate(AppRoutes.UploadPrescription, {
              phyPrescriptionsProp: response,
            });
          } else {
            setSelectPrescriptionVisible(true);
          }
        }}
      />
    );
  };

  const [imgHeight, setImgHeight] = useState(120);
  const { width: winWidth } = Dimensions.get('window');
  const [bannerLoading, setBannerLoading] = useState(true);

  const renderBannerImageToGetAspectRatio = () => {
    const imageUri = g(banners, '0' as any, 'image');
    const imageFullUri = imageUri ? productsThumbnailUrl(imageUri) : '';
    return (
      !!imageFullUri &&
      bannerLoading && (
        <View style={{ height: 0 }}>
          <ImageNative
            onLoad={(value) => {
              const { height, width } = value.nativeEvent.source;
              setImgHeight(height * (winWidth / width));
              setBannerLoading(false);
            }}
            style={{ width: '100%', height: 120 }}
            source={{ uri: imageFullUri }}
          />
        </View>
      )
    );
  };

  const renderSliderItem = ({ item, index }: { item: OfferBannerSection; index: number }) => {
    const handleOnPress = () => {
      const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_BANNER_CLICK] = {
        BannerPosition: slideIndex + 1,
      };
      postWebEngageEvent(WebEngageEventName.PHARMACY_BANNER_CLICK, eventAttributes);
      if (item.category_id) {
        props.navigation.navigate(AppRoutes.SearchByBrand, {
          category_id: item.category_id,
          title: item.name || '',
        });
      } else if (item.sku) {
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: item.sku,
        });
      }
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={handleOnPress}>
        <ImageNative
          resizeMode="stretch"
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: productsThumbnailUrl(item.image) }}
        />
      </TouchableOpacity>
    );
  };

  const [slideIndex, setSlideIndex] = useState(0);

  const renderDot = (active: boolean) => (
    <View style={[styles.sliderDotStyle, { backgroundColor: active ? '#aaa' : '#d8d8d8' }]} />
  );

  const renderBanners = () => {
    if (loading || bannerLoading) {
      return (
        <View style={[styles.sliderPlaceHolderStyle, { height: imgHeight }]}>
          <Spinner
            // spinnerProps={{ size: 'small' }}
            style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
          />
        </View>
      );
    } else if (banners.length && !isSelectPrescriptionVisible) {
      return (
        <View>
          <Carousel
            onSnapToItem={setSlideIndex}
            data={banners}
            renderItem={renderSliderItem}
            sliderWidth={winWidth}
            itemWidth={winWidth}
            loop={true}
            autoplay={isSelectPrescriptionVisible ? false : true}
            autoplayDelay={3000}
            autoplayInterval={3000}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              position: 'absolute',
              bottom: 10,
              alignSelf: 'center',
            }}
          >
            {banners.map((_, index) => (index == slideIndex ? renderDot(true) : renderDot(false)))}
          </View>
        </View>
      );
    }
  };

  const uploadPrescriptionCTA = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0),
              paddingBottom: 12,
            }}
          >
            Place your order via prescription
          </Text>
          <Button
            onPress={() => {
              const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED] = {
                Source: 'Home',
              };
              postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED, eventAttributes);
              setShowPopop(true);
            }}
            style={{ width: Platform.OS == 'android' ? '85%' : '90%' }}
            titleTextStyle={{
              ...theme.viewStyles.text('B', 17, '#fff', 1, 24, 0),
            }}
            title={'UPLOAD'}
          />
        </View>
        <PrescriptionPad style={{ height: 57, width: 42 }} />
      </View>
    );
  };

  const renderUploadPrescriptionSection = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.card(),
            marginTop: 10,
            marginBottom: 16,
          },
          medicineList.length > 0 && searchText
            ? {
                elevation: 0,
              }
            : {},
        ]}
      >
        {uploadPrescriptionCTA()}
      </View>
    );
  };

  const getOrderTitle = (
    order: getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails
  ) => {
    // use billedItems for delivered orders
    const billedItems = g(
      order,
      'medicineOrderShipments',
      '0' as any,
      'medicineOrderInvoice',
      '0' as any,
      'itemDetails'
    );
    const billedLineItems = billedItems
      ? (JSON.parse(billedItems) as { itemName: string }[])
      : null;
    const lineItems = (billedLineItems || g(order, 'medicineOrderLineItems') || []) as {
      itemName?: string;
      medicineName?: string;
    }[];
    let title = 'Medicines';

    if (lineItems.length) {
      const firstItem = g(lineItems, '0' as any, billedLineItems ? 'itemName' : 'medicineName')!;
      const lineItemsLength = lineItems.length;
      title =
        lineItemsLength > 1
          ? `${firstItem} + ${lineItemsLength - 1} item${lineItemsLength > 2 ? 's ' : ' '}`
          : firstItem;
    }

    return title;
  };

  const getOrderSubtitle = (
    order: getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails
  ) => {
    const isOfflineOrder = !!g(order, 'billNumber');
    const shopAddress = isOfflineOrder && g(order, 'shopAddress');
    const parsedShopAddress = isOfflineOrder && JSON.parse(shopAddress || '{}');
    const address = [
      g(parsedShopAddress, 'storename'),
      g(parsedShopAddress, 'city'),
      g(parsedShopAddress, 'zipcode'),
    ]
      .filter((a) => a)
      .join(', ');
    const date = moment(g(order, 'medicineOrdersStatus', '0' as any, 'statusDate')).format(
      'MMMM DD, YYYY'
    );
    return isOfflineOrder ? `Ordered at ${address} on ${date}` : `Ordered online on ${date}`;
  };

  const [reOrderDetails, setReOrderDetails] = useState<MedicineReOrderOverlayProps['itemDetails']>({
    total: 0,
    unavailable: [],
  });

  const reOrder = async (
    order: getLatestMedicineOrder_getLatestMedicineOrder_medicineOrderDetails
  ) => {
    try {
      globalLoading!(true);
      const { items, prescriptions, totalItemsCount, unavailableItems } = await reOrderMedicines(
        order,
        currentPatient,
        'Medicine Home'
      );
      items.length && addMultipleCartItems!(items);
      items.length && prescriptions.length && addMultipleEPrescriptions!(prescriptions);
      globalLoading!(false);
      if (unavailableItems.length) {
        setReOrderDetails({ total: totalItemsCount, unavailable: unavailableItems });
      } else {
        props.navigation.navigate(AppRoutes.YourCart);
      }
    } catch (error) {
      CommonBugFender(`${AppRoutes.OrderDetailsScene}_reOrder`, error);
      globalLoading!(false);
      showAphAlert!({
        title: string.common.uhOh,
        description: "We're sorry! Unable to re-order right now.",
      });
    }
  };

  const renderMedicineReOrderOverlay = () => {
    const { total, unavailable } = reOrderDetails;
    return (
      !!total && (
        <MedicineReOrderOverlay
          itemDetails={{ total, unavailable }}
          onContinue={() => {
            setReOrderDetails({ total: 0, unavailable: [] });
            props.navigation.navigate(AppRoutes.YourCart);
          }}
          onClose={() => {
            setReOrderDetails({ total: 0, unavailable: [] });
          }}
        />
      )
    );
  };

  const renderLatestOrderInfo = () => {
    const goToOrderDetails = () => {
      props.navigation.navigate(AppRoutes.OrderDetailsScene, {
        orderAutoId: latestMedicineOrder!.orderAutoId,
        billNumber: latestMedicineOrder!.billNumber,
      });
    };
    return (
      !!latestMedicineOrder && (
        <ListItem
          title={getOrderTitle(latestMedicineOrder)}
          subtitle={getOrderSubtitle(latestMedicineOrder)}
          leftAvatar={<ShoppingBasketIcon />}
          rightTitle={'REORDER'}
          pad={12}
          topDivider
          rightContentContainerStyle={{ flexGrow: 0.35 }}
          containerStyle={{ paddingHorizontal: 0, alignItems: 'flex-start' }}
          titleStyle={theme.viewStyles.text('M', 16, '#02475b', 1, 24)}
          subtitleStyle={theme.viewStyles.text('M', 11, '#02475b', 0.7, 15)}
          rightTitleStyle={{
            padding: 8,
            paddingRight: 0,
            ...theme.viewStyles.text('M', 12, '#fcb716'),
          }}
          titleProps={{ numberOfLines: 1, ellipsizeMode: 'middle', onPress: goToOrderDetails }}
          rightTitleProps={{
            onPress: () => reOrder(latestMedicineOrder),
          }}
        />
      )
    );
  };

  const renderYourOrders = () => {
    return (
      <View style={{ ...theme.viewStyles.card(), paddingVertical: 0, marginTop: 5 }}>
        <ListItem
          title={'My Orders'}
          leftAvatar={<MedicineIcon />}
          rightAvatar={<ArrowRight />}
          pad={16}
          Component={TouchableOpacity}
          onPress={() => {
            postMyOrdersClicked('Pharmacy Home', currentPatient);
            props.navigation.navigate(AppRoutes.YourOrdersScene);
          }}
          containerStyle={{ paddingHorizontal: 0 }}
          titleStyle={theme.viewStyles.text('M', 16, '#01475b', 1, 24)}
        />
        {renderLatestOrderInfo()}
      </View>
    );
  };

  const renderBrandCard = (imgUrl: string, onPress: () => void, style?: ViewStyle) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View
          style={[
            {
              ...theme.viewStyles.card(12, 0),
              elevation: 10,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: 152,
              height: 68,
            },
            style,
          ]}
        >
          <Image
            placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
            source={{ uri: imgUrl }}
            style={{
              height: 45,
              width: 80,
            }}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderCatalogCard = (
    text: string,
    imgUrl: string,
    onPress: () => void,
    style?: ViewStyle
  ) => {
    return (
      <TouchableOpacity activeOpacity={1} onPress={onPress}>
        <View
          style={[
            {
              ...theme.viewStyles.card(12, 0),
              elevation: 10,
              flexDirection: 'row',
              width: 156,
              height: 68,
            },
            style,
          ]}
        >
          <Image
            placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
            source={{ uri: imgUrl }}
            style={{
              height: 40,
              width: 40,
            }}
          />
          <View style={{ width: 16 }} />
          <Text
            numberOfLines={2}
            style={{
              flex: 1,
              ...theme.viewStyles.text('M', 14, '#01475b', 1, 20, 0),
            }}
          >
            {text}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategories = (title: string, categories: MedicinePageSection[]) => {
    if (categories.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={title} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={categories}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.title,
              productsThumbnailUrl(item.image_url),
              () => {
                postwebEngageCategoryClickedEvent(
                  item.category_id,
                  item.title,
                  title,
                  productsThumbnailUrl(item.image_url)
                );
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                });
              },
              {
                marginHorizontal: 4,
                marginTop: 16,
                marginBottom: 20,
                ...(index == 0 ? { marginLeft: 20 } : {}),
              }
            );
          }}
        />
      </View>
    );
  };

  const renderDealsOfTheDay = (title: string) => {
    if (dealsOfTheDay.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={title} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={dealsOfTheDay}
          renderItem={({ item, index }) => {
            return (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                  postwebEngageCategoryClickedEvent(
                    item.category_id,
                    'Banner',
                    title,
                    productsThumbnailUrl(item.image_url)
                  );
                  props.navigation.navigate(AppRoutes.SearchByBrand, {
                    category_id: item.category_id,
                    title: title,
                  });
                }}
              >
                <Image
                  placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
                  source={{ uri: productsThumbnailUrl(item.image_url) }}
                  containerStyle={{
                    ...theme.viewStyles.card(0, 0),
                    elevation: 10,

                    marginHorizontal: 4,
                    marginTop: 16,
                    marginBottom: 20,
                    ...(index == 0 ? { marginLeft: 20 } : {}),
                    height: 144,
                    width: Dimensions.get('screen').width * 0.86,
                  }}
                  resizeMode="contain"
                  style={{
                    borderRadius: 10,
                    height: 144,
                    width: Dimensions.get('screen').width * 0.86,
                  }}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const hotSellerCard = (data: {
    name: string;
    imgUrl: string;
    price: number;
    specialPrice?: number;
    isAddedToCart: boolean;
    onAddOrRemoveCartItem: () => void;
    onPress: () => void;
    style?: ViewStyle;
  }) => {
    const { name, imgUrl, price, specialPrice, style } = data;
    const discount = Math.floor(((Number(price) - Number(specialPrice!)) / price) * 100);

    const localStyles = StyleSheet.create({
      discountedPriceText: {
        ...theme.viewStyles.text('M', 14, '#01475b', 0.6, 24),
        textAlign: 'center',
      },
      priceText: {
        ...theme.viewStyles.text('B', 14, '#01475b', 1, 24),
        textAlign: 'center',
      },
      discountPercentageTagView: {
        elevation: 20,
        position: 'absolute',
        right: 15,
        top: 16,
        zIndex: 1,
      },
      discountPercentageText: {
        ...theme.viewStyles.text('B', 12, '#ffffff', 1, 24),
        flex: 1,
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      },
      hotSellerCardView: {
        ...theme.viewStyles.card(12, 0),
        elevation: 10,
        height: 232,
        width: 162,
        marginHorizontal: 4,
        alignItems: 'center',
        ...style,
      },
    });

    const renderDiscountedPrice = () => {
      return (
        <View style={[{ flexDirection: 'row', marginBottom: 8 }]}>
          {!!specialPrice && !isNaN(discount) && !!discount && (
            <Text style={[localStyles.discountedPriceText, { marginRight: 4 }]}>
              (<Text style={[{ textDecorationLine: 'line-through' }]}>Rs. {price}</Text>)
            </Text>
          )}
          <Text style={localStyles.priceText}>Rs. {specialPrice || price}</Text>
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        {!isNaN(discount) && !!discount && (
          <View style={localStyles.discountPercentageTagView}>
            <OfferIcon />
            <Text style={localStyles.discountPercentageText}>-{discount}%</Text>
          </View>
        )}
        <View style={localStyles.hotSellerCardView}>
          <Image
            placeholderStyle={theme.viewStyles.imagePlaceholderStyle}
            source={{ uri: imgUrl }}
            style={{ height: 68, width: 68, marginBottom: 8 }}
          />
          <View style={{ height: 67.5 }}>
            <Text
              style={{
                ...theme.viewStyles.text('M', 14, '#01475b', 1, 20),
                textAlign: 'center',
              }}
              numberOfLines={3}
            >
              {name}
            </Text>
          </View>
          <Spearator style={{ marginBottom: 7.5 }} />
          {renderDiscountedPrice()}
          <Text
            style={{
              ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
              textAlign: 'center',
            }}
            onPress={data.onAddOrRemoveCartItem}
          >
            {data.isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHotSellerItem = (data: ListRenderItemInfo<MedicineProduct>, title: string) => {
    const {
      sku,
      is_prescription_required,
      name,
      mou,
      special_price,
      price,
      image,
      thumbnail,
      type_id,
    } = data.item;

    const addToCart = () => {
      addPharmaItemToCart(
        {
          id: sku,
          mou: mou,
          name: name,
          price: price,
          specialPrice: special_price
            ? typeof special_price == 'string'
              ? Number(special_price)
              : special_price
            : undefined,
          prescriptionRequired: is_prescription_required == '1',
          isMedicine: (type_id || '').toLowerCase() == 'pharma',
          quantity: 1,
          thumbnail,
          isInStock: true,
        },
        pharmacyPincode!,
        addCartItem,
        globalLoading,
        props.navigation,
        currentPatient,
        isPharmacyLocationServiceable
      );

      postwebEngageAddToCartEvent(data.item, 'Pharmacy Home', title);
      let id = currentPatient && currentPatient.id ? currentPatient.id : '';
      postAppsFlyerAddToCartEvent(data.item, id);
    };

    const removeFromCart = () => removeCartItem!(sku);
    const foundMedicineInCart = !!cartItems.find((item) => item.id == sku);

    return hotSellerCard({
      name,
      imgUrl: productsThumbnailUrl(image!),
      price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? Number(special_price)
          : special_price
        : undefined,
      isAddedToCart: foundMedicineInCart,
      onAddOrRemoveCartItem: foundMedicineInCart ? removeFromCart : addToCart,
      onPress: () => {
        const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_CATEGORY_SECTION_PRODUCT_CLICK] = {
          SectionName: title,
          ProductId: sku,
          ProductName: name,
        };
        postWebEngageEvent(
          WebEngageEventName.PHARMACY_CATEGORY_SECTION_PRODUCT_CLICK,
          eventAttributes
        );
        postwebEngageProductClickedEvent(data.item, title, 'Home');
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, { sku });
      },
      style: {
        marginHorizontal: 4,
        marginTop: 16,
        marginBottom: 20,
        ...(data.index == 0 ? { marginLeft: 20 } : {}),
      },
    });
  };

  const renderHotSellers = (title: string, products: MedicineProduct[], categoryId?: number) => {
    if (products.length == 0) return null;
    return (
      <View>
        <SectionHeader
          leftText={title}
          rightText={categoryId ? 'VIEW ALL' : ''}
          rightTextStyle={
            categoryId
              ? {
                  textAlign: 'right',
                  ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
                  width: '25%',
                }
              : {}
          }
          leftTextStyle={categoryId ? { width: '75%' } : {}}
          onPressRightText={
            categoryId
              ? () =>
                  props.navigation.navigate(AppRoutes.SearchByBrand, {
                    category_id: categoryId,
                    products: categoryId == -1 ? products : null,
                    title: `${title || 'Products'}`.toUpperCase(),
                  })
              : undefined
          }
          style={categoryId ? { paddingBottom: 1 } : {}}
        />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={products}
          renderItem={(itemData) => renderHotSellerItem(itemData, title)}
        />
      </View>
    );
  };

  const renderShopByBrand = (title: string) => {
    if (shopByBrand.length == 0) return null;
    return (
      <View>
        <SectionHeader
          leftText={title}
          rightText={'VIEW ALL'}
          rightTextStyle={{
            textAlign: 'right',
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
            width: '25%',
          }}
          leftTextStyle={{ width: '75%' }}
          onPressRightText={() =>
            props.navigation.navigate(AppRoutes.ShopByBrand, {
              allBrandData: allBrandData,
              setAllBrandData: (data: Brand[]) => setAllBrandData(data),
            })
          }
          style={{ paddingBottom: 1 }}
        />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={shopByBrand}
          renderItem={({ item, index }) => {
            const imgUrl = productsThumbnailUrl(item.image_url);
            return renderBrandCard(
              imgUrl,
              () => {
                postwebEngageCategoryClickedEvent(
                  item.category_id,
                  item.title,
                  title,
                  productsThumbnailUrl(item.image_url)
                );
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                });
              },
              {
                marginHorizontal: 4,
                marginTop: 16,
                marginBottom: 20,
                ...(index == 0 ? { marginLeft: 20 } : {}),
              }
            );
          }}
        />
      </View>
    );
  };

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [itemsLoading, setItemsLoading] = useState<{ [key: string]: boolean }>({});

  const onSearchMedicine = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      setSearchText(_searchText);
      if (!(_searchText && _searchText.length > 2)) {
        setMedicineList([]);
        return;
      }
      setsearchSate('load');
      getMedicineSearchSuggestionsApi(_searchText)
        .then(({ data }) => {
          // aphConsole.log({ data });
          const products = data.products || [];
          setMedicineList(products);
          setsearchSate('success');
          const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
            keyword: _searchText,
            Source: 'Pharmacy Home',
            resultsdisplayed: products.length,
          };
          postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);
        })
        .catch((e) => {
          CommonBugFender('Medicine_onSearchMedicine', e);
          // aphConsole.log({ e });
          if (!Axios.isCancel(e)) {
            setsearchSate('fail');
          }
        });
    }
  };

  const renderSearchBar = () => {
    const isFocusedStyle = isSearchFocused;
    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: isFocusedStyle
        ? {
            borderBottomColor: '#00b38e',
            borderBottomWidth: 2,
            marginHorizontal: 10,
          }
        : {
            borderRadius: 5,
            backgroundColor: '#f7f8f5',
            marginHorizontal: 10,
            paddingHorizontal: 16,
            borderBottomWidth: 0,
          },
      rightIconContainerStyle: isFocusedStyle
        ? {
            height: 24,
          }
        : {},
      style: isFocusedStyle
        ? {
            paddingBottom: 18.5,
          }
        : { borderRadius: 5 },
      containerStyle: isFocusedStyle
        ? {
            marginBottom: 20,
            marginTop: 8,
          }
        : {
            marginBottom: 20,
            marginTop: 12,
            alignSelf: 'center',
          },
    });

    const shouldEnableSearchSend = searchText.length > 2;
    const rigthIconView = (
      <TouchableOpacity
        activeOpacity={1}
        style={{
          opacity: shouldEnableSearchSend ? 1 : 0.4,
        }}
        disabled={!shouldEnableSearchSend}
        onPress={() => {
          const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
            keyword: searchText,
            Source: 'Pharmacy Home',
          };
          postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);
          props.navigation.navigate(AppRoutes.SearchMedicineScene, { searchText });
          setSearchText('');
          setMedicineList([]);
        }}
      >
        <SearchSendIcon />
      </TouchableOpacity>
    );

    const itemsNotFound =
      searchSate == 'success' && searchText.length > 2 && medicineList.length == 0;

    return (
      <>
        <Input
          autoFocus={focusSearch}
          onSubmitEditing={() => {
            if (searchText.length > 2) {
              const eventAttributes: WebEngageEvents[WebEngageEventName.PHARMACY_SEARCH_RESULTS] = {
                keyword: searchText,
                Source: 'Pharmacy Home',
              };
              postWebEngageEvent(WebEngageEventName.PHARMACY_SEARCH_RESULTS, eventAttributes);

              const searchEventAttribute: WebEngageEvents[WebEngageEventName.SEARCH_ENTER_CLICK] = {
                keyword: searchText,
                numberofresults: medicineList.length,
              };
              postWebEngageEvent(WebEngageEventName.SEARCH_ENTER_CLICK, searchEventAttribute);
              props.navigation.navigate(AppRoutes.SearchMedicineScene, { searchText });
            }
          }}
          value={searchText}
          autoCapitalize="none"
          spellCheck={false}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            setSearchFocused(false);
            setMedicineList([]);
            setSearchText('');
            setsearchSate('success');
          }}
          onChangeText={(value) => {
            onSearchMedicine(value);
          }}
          autoCorrect={false}
          rightIcon={isSearchFocused ? rigthIconView : <View />}
          placeholder="Search meds, brands &amp; more"
          selectionColor={itemsNotFound ? '#02475b' : '#00b38e'}
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={styles.inputStyle}
          inputContainerStyle={[
            styles.inputContainerStyle,
            itemsNotFound ? { borderBottomColor: '#02475b' } : {},
          ]}
          rightIconContainerStyle={styles.rightIconContainerStyle}
          style={styles.style}
          containerStyle={styles.containerStyle}
          errorStyle={{
            ...theme.viewStyles.text('M', 14, '#02475b'),
            marginHorizontal: 10,
          }}
          errorMessage={itemsNotFound ? `Hit enter to search for '${searchText}'` : undefined}
        />
      </>
    );
  };

  const client = useApolloClient();
  const savePastSeacrh = (sku: string, name: string) =>
    client.mutate({
      mutation: SAVE_SEARCH,
      variables: {
        saveSearchInput: {
          type: SEARCH_TYPE.MEDICINE,
          typeId: sku,
          typeName: name,
          patient: currentPatient && currentPatient.id ? currentPatient.id : '',
        },
      },
    });

  const onAddCartItem = (item: MedicineProduct) => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      type_id,
      thumbnail,
    } = item;
    setItemsLoading({ ...itemsLoading, [sku]: true });
    addPharmaItemToCart(
      {
        id: sku,
        mou,
        name,
        price: price,
        specialPrice: special_price
          ? typeof special_price == 'string'
            ? Number(special_price)
            : special_price
          : undefined,
        prescriptionRequired: is_prescription_required == '1',
        isMedicine: (type_id || '').toLowerCase() == 'pharma',
        quantity: Number(1),
        thumbnail: thumbnail,
        isInStock: true,
      },
      pharmacyPincode!,
      addCartItem,
      null,
      props.navigation,
      currentPatient,
      isPharmacyLocationServiceable,
      () => setItemsLoading({ ...itemsLoading, [sku]: false })
    );
    postwebEngageAddToCartEvent(item, 'Pharmacy Partial Search');
    let id = currentPatient && currentPatient.id ? currentPatient.id : '';
    console.log(item);
    postAppsFlyerAddToCartEvent(item, id);
  };

  const getItemQuantity = (id: string) => {
    const foundItem = cartItems.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 0;
  };

  const onNotifyMeClick = (name: string) => {
    showAphAlert!({
      title: 'Okay! :)',
      description: `You will be notified when ${name} is back in stock.`,
    });
  };

  const onUpdateCartItem = (id: string, quantity: number) => {
    updateCartItem!({ id, quantity: quantity });
  };

  const onRemoveCartItem = (id: string) => {
    removeCartItem!(id);
  };

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<MedicineProduct>) => {
    const { item, index } = data;
    return (
      <MedicineSearchSuggestionItem
        onPress={() => {
          postwebEngageProductClickedEvent(item, 'HOME SEARCH', 'Search');
          CommonLogEvent(AppRoutes.Medicine, 'Search suggestion Item');
          savePastSeacrh(`${item.sku}`, item.name).catch((e) => {});
          props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
            sku: item.sku,
          });
        }}
        onPressAddToCart={() => {
          onAddCartItem(item);
        }}
        onPressNotify={() => {
          onNotifyMeClick(item.name);
        }}
        onPressAdd={() => {
          const q = getItemQuantity(item.sku);
          if (q == 20) return;
          onUpdateCartItem(item.sku, getItemQuantity(item.sku) + 1);
        }}
        onPressSubstract={() => {
          const q = getItemQuantity(item.sku);
          q == 1 ? onRemoveCartItem(item.sku) : onUpdateCartItem(item.sku, q - 1);
        }}
        quantity={getItemQuantity(item.sku)}
        data={item}
        loading={itemsLoading[item.sku]}
        showSeparator={index !== medicineList.length - 1}
        style={{
          marginHorizontal: 20,
          paddingBottom: index == medicineList.length - 1 ? 10 : 0,
        }}
      />
    );
  };

  const renderSearchSuggestions = () => {
    // if (medicineList.length == 0) return null;
    return (
      <View style={{ width: '100%', position: 'absolute' }}>
        {searchSate == 'load' ? (
          <View style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}>
            {renderSectionLoader(266)}
          </View>
        ) : (
          !!searchText &&
          searchText.length > 2 && (
            <FlatList
              keyboardShouldPersistTaps="always"
              // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
              bounces={false}
              keyExtractor={(_, index) => `${index}`}
              showsVerticalScrollIndicator={false}
              style={{
                paddingTop: 10.5,
                maxHeight: 266,
                backgroundColor: '#f7f8f5',
              }}
              data={medicineList}
              extraData={itemsLoading}
              renderItem={renderSearchSuggestionItemView}
            />
          )
        )}
      </View>
    );
  };

  const renderSearchBarAndSuggestions = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          Keyboard.dismiss();
        }}
        style={[
          (searchSate == 'success' || searchSate == 'fail') && medicineList.length == 0
            ? {
                height: '100%',
                width: '100%',
              }
            : searchText.length > 2
            ? {
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(0,0,0,0.8)',
              }
            : {},
        ]}
      >
        {renderSearchSuggestions()}
      </TouchableOpacity>
    );
  };

  const renderSectionsWithOrdering = () => {
    const info = AppConfig.Configuration.PHARMACY_HOMEPAGE_INFO;
    const sectionMapping = {
      healthareas: renderCategories,
      deals_of_the_day: renderDealsOfTheDay,
      shop_by_category: renderCategories,
      shop_by_brand: renderShopByBrand,
      hot_sellers: renderHotSellers,
      monsoon_essentials: renderHotSellers,
      widget_2: renderHotSellers,
      widget_3: renderHotSellers,
    };
    const sectionDataMapping = {
      healthareas: [healthAreas, 0],
      deals_of_the_day: [[], 0],
      shop_by_category: [shopByCategory, 0],
      shop_by_brand: [[], 0],
      hot_sellers: [hotSellers, hotSellersCategoryId],
      monsoon_essentials: [monsoonEssentials, monsoonEssentialsCategoryId],
      widget_2: [widget2, widget2CategoryId],
      widget_3: [widget3, widget3CategoryId],
    };
    const sectionsView = info
      .filter((item) => item.visible)
      .sort((a, b) => Number(a.section_position) - Number(b.section_position))
      .map((item) => {
        const sectionsView =
          item.section_key &&
          item.section_name &&
          sectionMapping[item.section_key as keyof typeof sectionMapping];
        const sectionData =
          sectionsView && sectionDataMapping[item.section_key as keyof typeof sectionDataMapping];

        return sectionsView
          ? sectionsView(item.section_name, sectionData[0] as [], sectionData[1] as number)
          : null;
      });

    return sectionsView;
  };

  const renderRecommendedProducts = () => {
    return renderHotSellers('RECOMMENDED FOR YOU', recommendedProducts, -1);
  };

  const renderSections = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          if (medicineList.length == 0 && !searchText) return;
          setSearchText('');
          setMedicineList([]);
        }}
        style={{ flex: 1 }}
      >
        {renderBannerImageToGetAspectRatio()}
        {renderBanners()}
        {renderYourOrders()}
        {renderRecommendedProducts()}
        {loading ? renderSectionLoader() : !error && renderSectionsWithOrdering()}
        {renderUploadPrescriptionSection()}
        {!error && <View style={{ height: 20 }} />}
      </TouchableOpacity>
    );
  };

  const renderPincodePopup = () => {
    const onClose = (serviceable?: boolean, response?: LocationData) => {
      setPincodePopupVisible(false);
      if (serviceable) {
        setServiceabilityMsg('');
        setPharmacyLocationServiceable!(true);
      }
    };
    return pincodePopupVisible && <PincodePopup onClickClose={onClose} onComplete={onClose} />;
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderTopView()}
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[0]}
          scrollEventThrottle={20}
          // contentContainerStyle={[isSearchFocused ? { flex: 1 } : {}]}
          contentContainerStyle={[
            isSearchFocused && searchText.length > 2 && medicineList.length > 0 ? { flex: 1 } : {},
          ]}
        >
          <View style={[isSearchFocused ? { flex: 1 } : { flex: 1 }]}>
            <View style={{ backgroundColor: 'white' }}>{renderSearchBar()}</View>
            {renderSearchBarAndSuggestions()}
          </View>
          <View style={[isSearchFocused && searchText.length > 2 ? { height: 0 } : {}]}>
            {renderSections()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {isSelectPrescriptionVisible && renderEPrescriptionModal()}
      {ShowPopop && renderUploadPrescriprionPopup()}
      {renderPincodePopup()}
      {renderMedicineReOrderOverlay()}
    </View>
  );
};
