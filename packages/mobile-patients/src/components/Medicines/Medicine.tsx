import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CartIcon,
  DropdownGreen,
  FileBig,
  InjectionIcon,
  MedicineIcon,
  MedicineRxIcon,
  NotificationIcon,
  SearchSendIcon,
  SyrupBottleIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import { NeedHelpAssistant } from '@aph/mobile-patients/src/components/ui/NeedHelpAssistant';
import { ProfileList } from '@aph/mobile-patients/src/components/ui/ProfileList';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { GET_MEDICINE_ORDERS_LIST, SAVE_SEARCH } from '@aph/mobile-patients/src/graphql/profiles';
import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
  GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import {
  Brand,
  Doseform,
  getMedicinePageProducts,
  getMedicineSearchSuggestionsApi,
  MedicinePageAPiResponse,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useQuery, useApolloClient } from 'react-apollo-hooks';
import {
  AsyncStorage,
  Dimensions,
  Keyboard,
  ListRenderItemInfo,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Image, Input } from 'react-native-elements';
import { FlatList, NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';
import moment from 'moment';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';

const styles = StyleSheet.create({
  labelView: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff748e',
    height: 14,
    width: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
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
  nameTextStyle: {
    marginLeft: 5,
    color: '#02475b',
    ...theme.fonts.IBMPlexSansSemiBold(36),
  },
  seperatorStyle: {
    height: 2,
    backgroundColor: '#00b38e',
    marginTop: 2,
    //marginHorizontal: 5,
    marginBottom: 5,
  },
});

export interface MedicineProps extends NavigationScreenProps {}

export const Medicine: React.FC<MedicineProps> = (props) => {
  const [ShowPopop, setShowPopop] = useState<boolean>(false);
  const [isSelectPrescriptionVisible, setSelectPrescriptionVisible] = useState(false);
  const config = AppConfig.Configuration;
  const { cartItems, addCartItem, removeCartItem } = useShoppingCart();
  const cartItemsCount = cartItems.length;
  const { currentPatient } = useAllCurrentPatients();
  const [profile, setProfile] = useState<GetCurrentPatients_getCurrentPatients_patients>(
    currentPatient!
  );
  const [allBrandData, setAllBrandData] = useState<Brand[]>([]);
  const [ordersFetched, setOrdersFetched] = useState<
    (GetMedicineOrdersList_getMedicineOrdersList_MedicineOrdersList | null)[]
  >([]);

  const { showAphAlert, setLoading: globalLoading } = useUIElements();
  const MEDICINE_LANDING_PAGE_DATA = 'MEDICINE_LANDING_PAGE_DATA';
  const max_time_to_use_local_medicine_data = 60; // in minutes
  type LocalMedicineData = {
    lastSavedTimestamp: number;
    data: MedicinePageAPiResponse;
  } | null;

  useEffect(() => {
    if (profile !== currentPatient) {
      globalLoading!(true);
      setProfile(currentPatient!);
      ordersRefetch().then(({ data }) => {
        const ordersData = (g(data, 'getMedicineOrdersList', 'MedicineOrdersList') || []).filter(
          (item) =>
            !(
              (item!.medicineOrdersStatus || []).length == 1 &&
              (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
            )
        );
        globalLoading!(false);
        setOrdersFetched(ordersData);
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
      .catch(() => {});

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
        setError(e);
        setLoading(false);
        showAphAlert!({
          title: 'Uh oh! :(',
          description: "We're unable to fetch products, try later.",
        });
      });
    if (ordersFetched.length === 0) {
      ordersRefetch().then(({ data }) => {
        const ordersData = (g(data, 'getMedicineOrdersList', 'MedicineOrdersList') || []).filter(
          (item) =>
            !(
              (item!.medicineOrdersStatus || []).length == 1 &&
              (item!.medicineOrdersStatus || []).find((item) => !item!.hideStatus)
            )
        );
        ordersData.length > 0 && setOrdersFetched(ordersData);
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

  // Common Views

  const renderSectionLoader = (height: number = 100) => {
    return <Spinner style={{ height, position: 'relative', backgroundColor: 'transparent' }} />;
  };

  const renderBadge = (count: number, containerStyle: StyleProp<ViewStyle>) => {
    return (
      <View style={[styles.labelView, containerStyle]}>
        <Text style={styles.labelText}>{count}</Text>
      </View>
    );
  };

  const renderTopView = () => {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          paddingTop: 16,
          paddingHorizontal: 20,
          backgroundColor: theme.colors.WHITE,
        }}
      >
        <TouchableOpacity
          activeOpacity={1}
          // onPress={() => props.navigation.popToTop()}
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
          <ApolloLogo />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true })
            }
            style={{ right: 20 }}
          >
            <CartIcon style={{}} />
            {cartItemsCount > 0 && renderBadge(cartItemsCount, {})}
          </TouchableOpacity>
          <NotificationIcon />
        </View>
      </View>
    );
  };

  const renderEPrescriptionModal = () => {
    return (
      <SelectEPrescriptionModal
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
        heading={'Upload Prescription(s)'}
        instructionHeading={'Instructions For Uploading Prescriptions'}
        instructions={[
          'Take clear picture of your entire prescription.',
          'Doctor details & date of the prescription should be clearly visible.',
          'Medicines will be dispensed as per prescription.',
        ]}
        optionTexts={{
          camera: 'TAKE A PHOTO',
          gallery: 'CHOOSE\nFROM GALLERY',
          prescription: 'SELECT FROM\nE-PRESCRIPTION',
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
  const renderOfferBanner = () => {
    if (loading) return null;
    else if (offerBannerImage)
      return (
        <Image
          // PlaceholderContent={renderSectionLoader(imgHeight)}
          placeholderStyle={styles.imagePlaceholderStyle}
          onLoad={(value) => {
            const { height, width } = value.nativeEvent.source;
            setImgHeight(height * (winWidth / width));
          }}
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: `${config.IMAGES_BASE_URL[0]}${offerBannerImage}` }}
          // resizeMode="contain"
          // style={{ width: Dimensions.get('screen').width, height: 120 }}
        />
      );
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
            Have a prescription ready?
          </Text>
          <Button
            onPress={() => {
              setShowPopop(true);
            }}
            style={{ width: 'auto' }}
            titleTextStyle={{
              ...theme.viewStyles.text('B', 13, '#fff', 1, 24, 0),
            }}
            title={'UPLOAD PRESCRIPTION'}
          />
        </View>
        <FileBig style={{ height: 60, width: 40 }} />
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
          Don’t have a prescription? Don’t worry!
        </Text>
        <Text
          onPress={() => props.navigation.navigate(AppRoutes.DoctorSearch)}
          style={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24, 0),
          }}
        >
          CONSULT A DOCTOR
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
          globalLoading!(true);
          props.navigation.navigate(AppRoutes.YourOrdersScene, {
            orders: ordersFetched,
            refetch: ordersRefetch,
            error: ordersError,
            loading: ordersLoading,
          });
        }}
        container={{ marginBottom: 24 }}
        title={'Your Orders'}
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
        <SectionHeader leftText={'SHOP BY HEALTH AREAS'} />
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
              () =>
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                }),
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
        <SectionHeader leftText={'DEALS OF THE DAY'} />
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
                  props.navigation.navigate(AppRoutes.SearchByBrand, {
                    category_id: item.category_id,
                    title: 'DEALS OF THE DAY',
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

    const renderDiscountedPrice = () => {
      const styles = StyleSheet.create({
        discountedPriceText: {
          ...theme.viewStyles.text('M', 14, '#01475b', 0.6, 24),
          textAlign: 'center',
        },
        priceText: {
          ...theme.viewStyles.text('B', 14, '#01475b', 1, 24),
          textAlign: 'center',
        },
      });
      return (
        <View style={[{ flexDirection: 'row', marginBottom: 8 }]}>
          {!!specialPrice && (
            <Text style={[styles.discountedPriceText, { marginRight: 4 }]}>
              (<Text style={[{ textDecorationLine: 'line-through' }]}>Rs. {price}</Text>)
            </Text>
          )}
          <Text style={styles.priceText}>Rs. {specialPrice || price}</Text>
        </View>
      );
    };

    return (
      <TouchableOpacity activeOpacity={1} onPress={data.onPress}>
        <View
          style={{
            ...theme.viewStyles.card(12, 0),
            elevation: 10,
            height: 232,
            width: 152,
            marginHorizontal: 4,
            alignItems: 'center',
            ...style,
          }}
        >
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
            {data.isAddedToCart ? 'REMOVE' : 'ADD TO CART'}
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
    } = data.item;
    const addToCart = () =>
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
        quantity: 1,
        thumbnail,
      });
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
      onPress: () => props.navigation.navigate(AppRoutes.MedicineDetailsScene, { sku }),
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
        <SectionHeader leftText={'HOT SELLERS'} />
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
        <SectionHeader leftText={'SHOP BY CATEGORY'} />
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
              () =>
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                }),
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
              () =>
                props.navigation.navigate(AppRoutes.SearchByBrand, {
                  category_id: item.category_id,
                  title: `${item.title || 'Products'}`.toUpperCase(),
                }),
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
      />
    );
  };

  const [searchText, setSearchText] = useState<string>('');
  const [medicineList, setMedicineList] = useState<MedicineProduct[]>([]);
  const [searchSate, setsearchSate] = useState<'load' | 'success' | 'fail' | undefined>();
  const [isSearchFocused, setSearchFocused] = useState(false);

  const onSearchMedicine = (_searchText: string) => {
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
      })
      .catch((e) => {
        // aphConsole.log({ e });
        if (!Axios.isCancel(e)) {
          setsearchSate('fail');
        }
      });
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

  const renderSearchBar = () => {
    const styles = StyleSheet.create({
      inputStyle: {
        minHeight: 29,
        ...theme.fonts.IBMPlexSansMedium(18),
      },
      inputContainerStyle: {
        borderBottomColor: '#00b38e',
        borderBottomWidth: 2,
        marginHorizontal: 10,
      },
      rightIconContainerStyle: {
        height: 24,
      },
      style: {
        paddingBottom: 18.5,
      },
      containerStyle: {
        marginBottom: 19,
        marginTop: 18,
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
          rightIcon={rigthIconView}
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
              // contentContainerStyle={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}
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

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderTopView()}
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
          // contentContainerStyle={[isSearchFocused ? { flex: 1 } : {}]}
          contentContainerStyle={[
            isSearchFocused && searchText.length > 2 && medicineList.length > 0 ? { flex: 1 } : {},
          ]}
        >
          <View style={{ backgroundColor: theme.colors.WHITE }}>
            <ProfileList
              unsetloaderDisplay={true}
              navigation={props.navigation}
              saveUserChange={true}
              childView={
                <View
                  style={{
                    flexDirection: 'row',
                    paddingRight: 8,
                    borderRightWidth: 0,
                    borderRightColor: 'rgba(2, 71, 91, 0.2)',
                    backgroundColor: theme.colors.WHITE,
                  }}
                >
                  <Text style={styles.hiTextStyle}>{'hi'}</Text>
                  <View>
                    <Text style={styles.nameTextStyle}>
                      {(currentPatient && currentPatient!.firstName!.toLowerCase()) || ''}
                    </Text>
                    <View style={styles.seperatorStyle} />
                  </View>
                  <View style={{ paddingTop: 15 }}>
                    <DropdownGreen />
                  </View>
                </View>
              }
              // selectedProfile={profile}
              setDisplayAddProfile={() => {}}
            ></ProfileList>
          </View>
          <View style={[isSearchFocused ? { flex: 1 } : {}]}>
            <View style={{ backgroundColor: 'white' }}>{renderSearchBar()}</View>
            {renderSearchBarAndSuggestions()}
          </View>
          <View style={[isSearchFocused && searchText.length > 2 ? { height: 0 } : {}]}>
            {renderSections()}
          </View>
        </ScrollView>
      </SafeAreaView>
      {renderEPrescriptionModal()}
      {renderUploadPrescriprionPopup()}
    </View>
  );
};
