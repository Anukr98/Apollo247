import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
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
  InjectionIcon,
  MedicineIcon,
  MedicineRxIcon,
  OfferIcon,
  PrescriptionPad,
  SearchSendIcon,
  SyrupBottleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GET_MEDICINE_ORDERS_LIST, SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import {
  Brand,
  Doseform,
  getMedicinePageProducts,
  getMedicineSearchSuggestionsApi,
  MedicinePageAPiResponse,
  MedicineProduct,
  pinCodeServiceabilityApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  doRequestAndAccessLocationModified,
  g,
  isValidSearch,
  postAppsFlyerAddToCartEvent,
  postwebEngageAddToCartEvent,
  postWebEngageEvent,
  postWEGNeedHelpEvent,
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
  NativeScrollEvent,
  NativeSyntheticEvent,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationActions, NavigationScreenProps, StackActions } from 'react-navigation';

const styles = StyleSheet.create({
  imagePlaceholderStyle: {
    backgroundColor: '#f7f8f5',
    opacity: 0.5,
    borderRadius: 5,
  },
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
});

export interface MedicineProps
  extends NavigationScreenProps<{
    focusSearch?: boolean;
  }> {}

export const Medicine: React.FC<MedicineProps> = (props) => {
  const focusSearch = props.navigation.getParam('focusSearch');
  const { locationDetails, pharmacyLocation, setPharmacyLocation } = useAppCommonData();
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [pincodePopupVisible, setPincodePopupVisible] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const config = AppConfig.Configuration;
  const { cartItems, addCartItem, removeCartItem } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const cartItemsCount = cartItems.length + diagnosticCartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>(
    currentPatient!
  );
  const [allBrandData, setAllBrandData] = useState<Brand[]>([]);
  const [ordersFetched, setOrdersFetched] = useState<
    (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList | null)[]
  >([]);
  const [serviceabilityMsg, setServiceabilityMsg] = useState('');

  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const MEDICINE_LANDING_PAGE_DATA = 'MEDICINE_LANDING_PAGE_DATA';
  const max_time_to_use_local_medicine_data = 60; // in minutes
  type LocalMedicineData = {
    lastSavedTimestamp: number;
    data: MedicinePageAPiResponse;
  } | null;

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
    sectionName: string
  ) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.CATEGORY_CLICKED] = {
      'category name': categoryName,
      'category ID': categoryId,
      'Section Name': sectionName,
      Source: 'Home',
    };
    postWebEngageEvent(WebEngageEventName.CATEGORY_CLICKED, eventAttributes);
  };

  const updateServiceability = (pincode: string) => {
    pinCodeServiceabilityApi(pincode)
      .then(({ data: { Availability } }) => {
        setServiceabilityMsg(Availability ? '' : 'Sorry, not serviceable here.');
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
    if (currentPatient && profile && profile.id !== currentPatient.id) {
      globalLoading!(true);
      setProfile(currentPatient);
      ordersRefetch()
        .then(({ data }) => {
          const ordersData = (g(data, 'getMedicineOrdersList', 'MedicineOrdersList') || []).filter(
            (item) =>
              !(
                (item!.medicineOrdersStatus || []).length == 1 &&
                (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
              )
          );
          globalLoading!(false);
          setOrdersFetched(ordersData);
        })
        .catch((e) => {
          CommonBugFender('Medicine_ordersRefetch_useEffect', e);
        });
    }
  }, [currentPatient]);

  useEffect(() => {
    // getting from local storage first for immediate rendering
    AsyncStorage.getItem(MEDICINE_LANDING_PAGE_DATA)
      .then((response) => {
        const dataToSave: LocalMedicineData = JSON.parse(response || 'null');
        if (dataToSave) {
          // setData(dataToSave.data);
          // setLoading(false);
          const savedTime = moment(dataToSave.lastSavedTimestamp);
          const currTime = moment(dataToSave.lastSavedTimestamp);
          const diff = currTime.diff(savedTime, 'minutes');
          console.log({ savedTime, currTime, diff, is: diff < 60 });
          if (diff <= max_time_to_use_local_medicine_data) {
            setData(dataToSave.data);
            setLoading(false);
          }
        }
      })
      .catch((e) => {
        CommonBugFender('Medicine_MEDICINE_LANDING_PAGE_DATA', e);
      });

    getMedicinePageProducts()
      .then((d) => {
        const localData: LocalMedicineData = {
          lastSavedTimestamp: new Date().getTime(),
          data: d.data,
        };
        d.data &&
          AsyncStorage.setItem(
            MEDICINE_LANDING_PAGE_DATA,
            JSON.stringify(localData)
          ).catch(() => {});
        setData(d.data);
        setLoading(false);
      })
      .catch((e) => {
        CommonBugFender('Medicine_getMedicinePageProducts', e);
        setError(e);
        setLoading(false);
        showAphAlert!({
          title: string.common.uhOh,
          description: "We're unable to fetch products, try later.",
        });
      });
    if (ordersFetched.length === 0) {
      ordersRefetch()
        .then(({ data }) => {
          const ordersData = (g(data, 'getMedicineOrdersList', 'MedicineOrdersList') || []).filter(
            (item) =>
              !(
                (item!.medicineOrdersStatus || []).length == 1 &&
                (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
              )
          );
          ordersData.length > 0 && setOrdersFetched(ordersData);
        })
        .catch((e) => {
          CommonBugFender('Medicine_ordersRefetch', e);
        });
    }
  }, []);

  const [data, setData] = useState<MedicinePageAPiResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const offerBanner = (g(data, 'mainbanners') || [])[0];
  const offerBannerImage = g(offerBanner, 'image');
  const healthAreas = g(data, 'healthareas') || [];
  const dealsOfTheDay = g(data, 'deals_of_the_day') || [];
  const shopByCategory = g(data, 'shop_by_category') || [];
  const shopByBrand = g(data, 'shop_by_brand') || [];
  const hotSellers = g(data, 'hot_sellers', 'products') || [];

  const {
    data: orders,
    error: ordersError,
    loading: ordersLoading,
    refetch: ordersRefetch,
  } = useQuery<GetMedicineOrdersList, GetMedicineOrdersListVariables>(GET_MEDICINE_ORDERS_LIST, {
    variables: { patientId: currentPatient && currentPatient.id },
    fetchPolicy: 'cache-first',
  });

  // Note: if hideStatus = true means display it, false measn hide it
  // let _orders = (
  //   (!ordersLoading && g(orders, 'getMedicineOrdersList', 'MedicineOrdersList')) ||
  //   []
  // ).filter(
  //   (item) =>
  //     !(
  //       (item!.medicineOrdersStatus || []).length == 1 &&
  //       (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
  //     )
  // );

  useEffect(() => {
    if (!ordersLoading) {
      const data = (g(orders, 'getMedicineOrdersList', 'MedicineOrdersList') || []).filter(
        (item) =>
          !(
            (item!.medicineOrdersStatus || []).length == 1 &&
            (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
          )
      );
      console.log('orders fetched', orders, 'data:', data);

      data.length > 0 && setOrdersFetched(data);
    }
  }, [ordersLoading]);

  // console.log('ORDERS\n', { _orders });

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
      apolloLogo: { width: 57, height: 37 },
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
      deliverToText: { ...theme.viewStyles.text('R', 11, '#01475b', 1, 18) },
      locationText: { ...theme.viewStyles.text('M', 14, '#01475b', 1, 18) },
      locationTextUnderline: {
        height: 2,
        backgroundColor: '#00b38e',
        opacity: 1,
      },
      dropdownGreenContainer: { justifyContent: 'flex-end', marginBottom: -2 },
      serviceabilityMsg: { ...theme.viewStyles.text('R', 10, '#890000') },
    });

    const renderApolloLogo = () => (
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
        <ApolloLogo style={localStyles.apolloLogo} resizeMode="contain" />
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
              setPincodePopupVisible(true);
            }
          }}
        >
          {renderDeliverToLocationCTA()}
        </MaterialMenu>
      );
    };

    const renderDeliverToLocationCTA = () => {
      const location = pharmacyLocation
        ? `${g(pharmacyLocation, 'city')} ${g(pharmacyLocation, 'pincode')}`
        : `${g(locationDetails, 'city')} ${g(locationDetails, 'pincode')}`;
      return (
        <View style={{ paddingLeft: 10 }}>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Text style={localStyles.deliverToText}>
                Deliver to {g(currentPatient, 'firstName') || ''}
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
            props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true })
          }
        >
          <CartIcon />
          {cartItemsCount > 0 && <Badge label={cartItemsCount} />}
        </TouchableOpacity>
      </View>
    );

    return (
      <View style={localStyles.headerContainer}>
        {renderApolloLogo()}
        {renderDeliverToLocationMenuAndCTA()}
        {renderCartIcon()}
      </View>
    );
  };

  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
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
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const renderOfferBanner = () => {
    if (loading) return null;
    else if (offerBannerImage) {
      return (
        <ImageNative
          onLoadStart={() => {
            setImageLoading(true);
          }}
          onLoadEnd={() => {
            setImageLoading(false);
          }}
          onLoad={(value) => {
            const { height, width } = value.nativeEvent.source;
            console.log(height, width, 'dsniu');
            setImgHeight(height * (winWidth / width));
          }}
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: `${config.IMAGES_BASE_URL[0]}${offerBannerImage}` }}
        />
      );
    }
  };

  const renderOfferBannerCover = () => {
    if (imageLoading && offerBannerImage) {
      return (
        <View
          style={{
            width: '100%',
            height: imgHeight,
            position: 'absolute',
            top: 0,
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <Spinner
            spinnerProps={{ size: 'small' }}
            style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
          />
        </View>
      );
    } else {
      return null;
    }
  };

  const uploadPrescriptionCTA = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text
            style={{
              ...theme.viewStyles.text('M', 16, '#02475b', 1, 24, 0),
              paddingBottom: 12,
            }}
          >
            Have a prescription ready?
          </Text>
          <Button
            onPress={() => {
              const eventAttributes: WebEngageEvents[WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED] = {
                Source: 'Home',
              };
              postWebEngageEvent(WebEngageEventName.UPLOAD_PRESCRIPTION_CLICKED, eventAttributes);
              setShowPopop(true);
            }}
            style={{ width: 'auto' }}
            titleTextStyle={{
              ...theme.viewStyles.text('B', 13, '#fff', 1, 24, 0),
            }}
            title={'UPLOAD PRESCRIPTION'}
          />
        </View>
        <PrescriptionPad style={{ height: 57, width: 42 }} />
      </View>
    );
  };

  const consultDoctorCTA = () => {
    return (
      <View>
        <Text
          style={{
            ...theme.viewStyles.text('M', 14, '#02475b', 1, 20, 0.04),
            paddingBottom: 8,
          }}
        >
          Don’t have a prescription? Don’t worry!
        </Text>
        <Text
          onPress={() => props.navigation.navigate(AppRoutes.DoctorSearch)}
          style={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24, 0),
          }}
        >
          CONSULT A DOCTOR
        </Text>
      </View>
    );
  };

  const renderUploadPrescriptionSection = () => {
    return (
      <View
        style={[
          {
            ...theme.viewStyles.card(),
            marginTop: 20,
            marginBottom: 12,
          },
          medicineList.length > 0 && searchText
            ? {
                elevation: 0,
              }
            : {},
        ]}
      >
        {uploadPrescriptionCTA()}
        <Spearator style={{ marginVertical: 11.5 }} />
        {consultDoctorCTA()}
      </View>
    );
  };

  const renderYourOrders = () => {
    console.log('rendereef', ordersFetched);

    return (
      // (ordersFetched.length > 0 && (
      <ListCard
        onPress={() => {
          postMyOrdersClicked('Pharmacy Home', currentPatient);
          globalLoading!(true);
          props.navigation.navigate(AppRoutes.YourOrdersScene, {
            orders: ordersFetched,
            refetch: ordersRefetch,
            error: ordersError,
            loading: ordersLoading,
          });
        }}
        container={{ marginBottom: 24 }}
        title={'My Orders'}
        leftIcon={<MedicineIcon />}
      />
      // )) ||
      // null
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
            // placeholderStyle={styles.imagePlaceholderStyle}
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
            // placeholderStyle={styles.imagePlaceholderStyle}
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

  const renderShopByHealthAreas = () => {
    if (healthAreas.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'SHOP BY HEALTH AREAS'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={healthAreas}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.title,
              `${config.IMAGES_BASE_URL[0]}${item.image_url}`,
              () => {
                postwebEngageCategoryClickedEvent(
                  item.category_id,
                  item.title,
                  'SHOP BY HEALTH AREAS'
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

  const renderDealsOfTheDay = () => {
    if (dealsOfTheDay.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'DEALS OF THE DAY'} />
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
                  postwebEngageCategoryClickedEvent(item.category_id, 'Banner', 'DEALS OF THE DAY');
                  props.navigation.navigate(AppRoutes.SearchByBrand, {
                    category_id: item.category_id,
                    title: 'DEALS OF THE DAY',
                  });
                }}
              >
                <Image
                  // placeholderStyle={styles.imagePlaceholderStyle}
                  source={{ uri: `${config.IMAGES_BASE_URL[0]}${item.image_url}` }}
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
          {!!specialPrice && (
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
        {!isNaN(discount) && (
          <View style={localStyles.discountPercentageTagView}>
            <OfferIcon />
            <Text style={localStyles.discountPercentageText}>-{discount}%</Text>
          </View>
        )}
        <View style={localStyles.hotSellerCardView}>
          <Image
            placeholderStyle={styles.imagePlaceholderStyle}
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

  const renderHotSellerItem = (data: ListRenderItemInfo<MedicineProduct>) => {
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
      addCartItem!({
        id: sku,
        mou: mou,
        name: name,
        price: price,
        specialPrice: special_price
          ? typeof special_price == 'string'
            ? parseInt(special_price)
            : special_price
          : undefined,
        prescriptionRequired: is_prescription_required == '1',
        isMedicine: type_id == 'Pharma',
        quantity: 1,
        thumbnail,
        isInStock: true,
      });
      postwebEngageAddToCartEvent(data.item, 'Pharmacy Home');
      postAppsFlyerAddToCartEvent(data.item, 'Pharmacy Home');
    };

    const removeFromCart = () => removeCartItem!(sku);
    const foundMedicineInCart = !!cartItems.find((item) => item.id == sku);

    return hotSellerCard({
      name,
      imgUrl: `${config.IMAGES_BASE_URL[0]}${image}`,
      price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? parseInt(special_price)
          : special_price
        : undefined,
      isAddedToCart: foundMedicineInCart,
      onAddOrRemoveCartItem: foundMedicineInCart ? removeFromCart : addToCart,
      onPress: () => {
        postwebEngageProductClickedEvent(data.item, 'HOT SELLERS', 'Home');
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

  const renderHotSellers = () => {
    if (hotSellers.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'HOT SELLERS'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={hotSellers}
          renderItem={renderHotSellerItem}
        />
      </View>
    );
  };

  const renderShopByCategory = () => {
    if (shopByCategory.length == 0) return null;
    return (
      <View>
        <SectionHeader leftText={'SHOP BY CATEGORY'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={shopByCategory}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.title,
              `${config.IMAGES_BASE_URL[0]}${item.image_url}`,
              () => {
                postwebEngageCategoryClickedEvent(item.category_id, item.title, 'SHOP BY CATEGORY');

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

  const renderShopByBrand = () => {
    if (shopByBrand.length == 0) return null;
    return (
      <View>
        <SectionHeader
          leftText={'SHOP BY BRAND'}
          rightText={'VIEW ALL'}
          rightTextStyle={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
          }}
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
            const imgUrl = `${config.IMAGES_BASE_URL[0].replace('/catalog/product', '')}${
              item.image_url.startsWith('/') ? item.image_url : `/${item.image_url}`
            }`;
            return renderBrandCard(
              imgUrl,
              () => {
                postwebEngageCategoryClickedEvent(item.category_id, item.title, 'SHOP BY BRAND');
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                });
              },
              {
                marginHorizontal: 4,
                marginTop: 16,
                marginBottom: 40,
                ...(index == 0 ? { marginLeft: 20 } : {}),
              }
            );
          }}
        />
      </View>
    );
  };

  const renderNeedHelp = () => {
    return (
      <NeedHelpAssistant
        navigation={props.navigation}
        containerStyle={{
          paddingBottom: 20,
        }}
        onNeedHelpPress={() => {
          postWEGNeedHelpEvent(currentPatient, 'Medicines');
        }}
      />
    );
  };

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);

  const onSearchMedicine = (_searchText: string) => {
    if (isValidSearch(_searchText)) {
      setSearchText(_searchText);
      if (!(_searchText && _searchText.length > 2)) {
        setMedicineList([]);
        return;
      }
      const eventAttributes: WebEngageEvents[WebEngageEventName.SEARCH] = {
        keyword: _searchText,
        Source: 'Pharmacy Home',
      };
      postWebEngageEvent(WebEngageEventName.SEARCH, eventAttributes);

      setsearchSate('load');
      getMedicineSearchSuggestionsApi(_searchText)
        .then(({ data }) => {
          // aphConsole.log({ data });
          const products = data.products || [];
          setMedicineList(products);
          setsearchSate('success');
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

  interface SuggestionType {
    name: string;
    price: number;
    specialPrice?: number;
    isOutOfStock: boolean;
    type: Doseform;
    imgUri?: string;
    prescriptionRequired: boolean;
    onPress: () => void;
    showSeparator?: boolean;
    style?: ViewStyle;
  }

  const renderSearchSuggestionItem = (data: SuggestionType) => {
    const localStyles = StyleSheet.create({
      containerStyle: {
        ...data.style,
      },
      iconAndDetailsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 9.5,
        marginHorizontal: 12,
      },
      iconOrImageContainerStyle: {
        width: 40,
      },
      nameAndPriceViewStyle: {
        flex: 1,
      },
    });

    const renderNamePriceAndInStockStatus = () => {
      return (
        <View style={localStyles.nameAndPriceViewStyle}>
          <Text
            numberOfLines={1}
            style={{ ...theme.viewStyles.text('M', 16, '#01475b', 1, 24, 0) }}
          >
            {data.name}
          </Text>
          {data.isOutOfStock ? (
            <Text style={{ ...theme.viewStyles.text('M', 12, '#890000', 1, 20, 0.04) }}>
              {'Out Of Stock'}
            </Text>
          ) : (
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04),
                }}
              >
                Rs. {data.specialPrice || data.price}
              </Text>
              {data.specialPrice ? (
                <Text
                  style={[
                    { ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04), marginLeft: 8 },
                  ]}
                >
                  {'('}
                  <Text style={{ textDecorationLine: 'line-through' }}>{`Rs. ${data.price}`}</Text>
                  {')'}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      );
    };

    const renderIconOrImage = () => {
      return (
        <View style={localStyles.iconOrImageContainerStyle}>
          {data.imgUri ? (
            <Image
              // placeholderStyle={styles.imagePlaceholderStyle}
              source={{ uri: data.imgUri }}
              style={{ height: 40, width: 40 }}
              resizeMode="contain"
            />
          ) : data.type == 'SYRUP' ? (
            <SyrupBottleIcon />
          ) : data.type == 'INJECTION' ? (
            <InjectionIcon />
          ) : data.prescriptionRequired ? (
            <MedicineRxIcon />
          ) : (
            <MedicineIcon />
          )}
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View style={localStyles.containerStyle} key={data.name}>
          <View style={localStyles.iconAndDetailsContainerStyle}>
            {renderIconOrImage()}
            <View style={{ width: 16 }} />
            {renderNamePriceAndInStockStatus()}
          </View>
          {data.showSeparator ? <Spearator /> : null}
        </View>
      </TouchableOpacity>
    );
  };

  const [scrollOffset, setScrollOffset] = useState<number>(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // console.log(`scrollOffset, ${event.nativeEvent.contentOffset.y}`);
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const renderSearchBar = () => {
    const isFocusedStyle = scrollOffset > 10 || isSearchFocused;
    // const isFocusedStyle = isSearchFocused;
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
          selectionColor={itemsNotFound ? '#890000' : '#00b38e'}
          underlineColorAndroid="transparent"
          placeholderTextColor="rgba(1,48,91, 0.4)"
          inputStyle={styles.inputStyle}
          inputContainerStyle={[
            styles.inputContainerStyle,
            itemsNotFound ? { borderBottomColor: '#890000' } : {},
          ]}
          rightIconContainerStyle={styles.rightIconContainerStyle}
          style={styles.style}
          containerStyle={styles.containerStyle}
          errorStyle={{
            ...theme.viewStyles.text('M', 12, '#890000'),
            marginHorizontal: 10,
          }}
          errorMessage={
            itemsNotFound ? 'Sorry, we couldn’t find what you are looking for :(' : undefined
          }
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

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<MedicineProduct>) => {
    const { index, item } = data;
    const imgUri = item.thumbnail ? `${config.IMAGES_BASE_URL[0]}${item.thumbnail}` : '';
    const specialPrice = item.special_price
      ? typeof item.special_price == 'string'
        ? parseInt(item.special_price)
        : item.special_price
      : undefined;
    return renderSearchSuggestionItem({
      onPress: () => {
        postwebEngageProductClickedEvent(item, 'HOME SEARCH', 'Search');
        CommonLogEvent(AppRoutes.Medicine, 'Search suggestion Item');
        savePastSeacrh(`${item.id}`, item.name).catch((e) => {});
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: item.sku,
        });
      },
      name: item.name,
      price: item.price,
      specialPrice: specialPrice,
      isOutOfStock: !item.is_in_stock,
      type: ((item.PharmaOverview || [])[0] || {}).Doseform,
      style: {
        marginHorizontal: 20,
        paddingBottom: index == medicineList.length - 1 ? 10 : 0,
      },
      showSeparator: !(index == medicineList.length - 1),
      imgUri,
      prescriptionRequired: item.is_prescription_required == '1',
    });
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
                backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR,
              }}
              data={medicineList}
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
        {renderOfferBanner()}
        {renderOfferBannerCover()}
        {renderUploadPrescriptionSection()}
        {renderYourOrders()}
        {loading
          ? renderSectionLoader()
          : !error && (
              <>
                {renderShopByHealthAreas()}
                {renderDealsOfTheDay()}
                {renderHotSellers()}
                {renderShopByCategory()}
                {renderShopByBrand()}
              </>
            )}
        {renderNeedHelp()}
      </TouchableOpacity>
    );
  };

  const renderPincodePopup = () => {
    const onClose = () => setPincodePopupVisible(false);
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
          onScroll={handleScroll}
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
    </View>
  );
};
