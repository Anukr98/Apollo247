import { ApolloLogo } from '@aph/mobile-patients/src/components/ApolloLogo';
import { SelectEPrescriptionModal } from '@aph/mobile-patients/src/components/Medicines/SelectEPrescriptionModal';
import { UploadPrescriprionPopup } from '@aph/mobile-patients/src/components/Medicines/UploadPrescriprionPopup';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { SectionHeader, Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  CartIcon,
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
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GET_MEDICINE_ORDERS_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetMedicineOrdersList,
  GetMedicineOrdersListVariables,
} from '@aph/mobile-patients/src/graphql/types/GetMedicineOrdersList';
import {
  Doseform,
  getMedicineSearchSuggestionsApi,
  getOfferBanner,
  getProductsByCategoryApi,
  MedicineProduct,
  ProductCategory,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { aphConsole, g } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { useFetch } from '@aph/mobile-patients/src/hooks/fetchHook';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { viewStyles } from '@aph/mobile-patients/src/theme/viewStyles';
import Axios from 'axios';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import {
  Dimensions,
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
import { FlatList, NavigationScreenProps } from 'react-navigation';
import { UserIntro } from '../ui/UserIntro';

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
    backgroundColor: '#f0f1ec',
    borderRadius: 5,
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

  // Hot Sellers Api Call
  const { data: hotSellers, loading: hsLoading, error: hsError } = useFetch(() =>
    getProductsByCategoryApi(ProductCategory.HOT_SELLERS)
  );
  const _hotSellers = (!hsLoading && !hsError && g(hotSellers, 'data', 'products')) || [];

  // Offer Banner Api Call
  const { data: offerBanner, loading: obLoading, error: obError } = useFetch(() =>
    getOfferBanner()
  );
  const _offerBanner = ((!obLoading && !obError && g(offerBanner, 'data', 'mainbanners')) || [])[0];
  const _offerBannerImage = g(_offerBanner, 'image');

  const { data: orders, error: ordersError, loading: ordersLoading } = useQuery<
    GetMedicineOrdersList,
    GetMedicineOrdersListVariables
  >(GET_MEDICINE_ORDERS_LIST, {
    variables: { patientId: currentPatient && currentPatient.id },
    fetchPolicy: 'no-cache',
  });

  const _orders =
    (!ordersLoading && g(orders, 'getMedicineOrdersList', 'MedicineOrdersList')) || [];

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
        <TouchableOpacity onPress={() => props.navigation.replace(AppRoutes.ConsultRoom)}>
          <ApolloLogo />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() =>
              props.navigation.navigate(AppRoutes.YourCart, { isComingFromConsult: true })
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

  const renderOfferBanner = () => {
    const [imgHeight, setImgHeight] = useState(120);
    if (obLoading) return renderSectionLoader;
    else if (!obLoading && !obError && _offerBannerImage)
      return (
        <Image
          // PlaceholderContent={renderSectionLoader(imgHeight)}
          placeholderStyle={styles.imagePlaceholderStyle}
          onLoad={(value) => {
            const { width: winWidth } = Dimensions.get('window');
            const { height, width } = value.nativeEvent.source;
            setImgHeight(height * (winWidth / width));
          }}
          style={{ width: '100%', minHeight: imgHeight }}
          source={{ uri: _offerBannerImage }}
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
    return (
      (!ordersLoading && _orders.length > 0 && (
        <ListCard
          onPress={() => props.navigation.navigate(AppRoutes.YourOrdersScene)}
          container={{ marginBottom: 24 }}
          title={'Your Orders'}
          leftIcon={<MedicineIcon />}
        />
      )) ||
      null
    );
  };

  const renderBrandCard = (imgUrl: string, onPress: () => void, style?: ViewStyle) => {
    return (
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
          source={{ uri: imgUrl }}
          style={{
            height: 45,
            width: 80,
          }}
        />
      </View>
    );
  };

  const renderCatalogCard = (
    text: string,
    imgUrl: string,
    onPress: () => void,
    style?: ViewStyle
  ) => {
    return (
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
    );
  };

  const brands = [
    {
      imgUrl: 'https://via.placeholder.com/80x45',
      goToPage: AppRoutes.SearchMedicineScene,
    },
  ];

  const healthAreas = [
    {
      text: 'Diabetes Care',
      imgUrl: 'https://via.placeholder.com/40',
      goToPage: AppRoutes.SearchMedicineScene,
    },
    {
      text: 'Pain Relief',
      imgUrl: 'https://via.placeholder.com/40',
      goToPage: AppRoutes.SearchMedicineScene,
    },
  ];

  const renderShopByHealthAreas = () => {
    return (
      <View>
        <SectionHeader leftText={'SHOP BY HEALTH AREAS'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          contentContainerStyle={
            {
              // paddingTop: 16,
              // paddingBottom: 20,
              // paddingLeft: 20,
            }
          }
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...healthAreas, ...healthAreas]}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.text,
              item.imgUrl,
              () => props.navigation.navigate(item.goToPage),
              {
                // marginRight: 8,
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
    return (
      <View>
        <SectionHeader leftText={'DEALS OF THE DAY'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          contentContainerStyle={
            {
              // paddingTop: 16,
              // paddingBottom: 20,
              // paddingLeft: 20,
            }
          }
          showsHorizontalScrollIndicator={false}
          horizontal
          data={Array.from({ length: 10 }).map(
            () => `https://via.placeholder.com/${Dimensions.get('screen').width * 0.86}x144`
          )}
          renderItem={({ item, index }) => {
            return (
              <Image
                source={{ uri: item }}
                containerStyle={{
                  ...theme.viewStyles.card(0, 0),
                  elevation: 10,
                  // marginRight: 8,
                  marginHorizontal: 4,
                  marginTop: 16,
                  marginBottom: 20,
                  ...(index == 0 ? { marginLeft: 20 } : {}),
                }}
                style={{
                  borderRadius: 10,
                  height: 144,
                  width: Dimensions.get('screen').width * 0.86,
                }}
              />
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
            // marginRight: 8,
            marginHorizontal: 4,
            alignItems: 'center',
            ...style,
          }}
        >
          <Image
            placeholderStyle={{ backgroundColor: '#f0f1ec', borderRadius: 5 }}
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
              ...theme.viewStyles.text('B', 13, '#fc9916', data.isAddedToCart ? 0.5 : 1, 24),
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
        price: specialPrice,
        prescriptionRequired: is_prescription_required == '1',
        quantity: 1,
        thumbnail,
      });
    const removeFromCart = () => removeCartItem!(sku);
    const foundMedicineInCart = !!cartItems.find((item) => item.id == sku);
    const specialPrice = special_price
      ? typeof special_price == 'string'
        ? parseInt(special_price)
        : special_price
      : price;

    return hotSellerCard({
      name,
      imgUrl: `${config.IMAGES_BASE_URL}${image}`,
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
        // marginRight: 8,
        marginHorizontal: 4,
        marginTop: 16,
        marginBottom: 20,
        ...(data.index == 0 ? { marginLeft: 20 } : {}),
      },
    });
  };

  const renderHotSellers = () => {
    return (
      <View>
        <SectionHeader leftText={'HOT SELLERS'} />
        {hsLoading ? (
          renderSectionLoader()
        ) : (
          <FlatList
            bounces={false}
            keyExtractor={(_, index) => `${index}`}
            showsHorizontalScrollIndicator={false}
            horizontal
            data={_hotSellers}
            renderItem={renderHotSellerItem}
          />
        )}
      </View>
    );
  };

  const renderShopByCategory = () => {
    return (
      <View>
        <SectionHeader leftText={'SHOP BY CATEGORY'} />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          contentContainerStyle={
            {
              // paddingTop: 16,
              // paddingBottom: 20,
              // paddingLeft: 20,
            }
          }
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...healthAreas, ...healthAreas]}
          renderItem={({ item, index }) => {
            return renderCatalogCard(
              item.text,
              item.imgUrl,
              () => props.navigation.navigate(item.goToPage),
              {
                // marginRight: 8,
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
    return (
      <View>
        <SectionHeader
          leftText={'SHOP BY BRAND'}
          rightText={'VIEW ALL'}
          rightTextStyle={{
            ...theme.viewStyles.text('B', 13, '#fc9916', 1, 24),
          }}
          onPressRightText={() => props.navigation.navigate(AppRoutes.ShopByBrand)}
          style={{ paddingBottom: 1 }}
        />
        <FlatList
          bounces={false}
          keyExtractor={(_, index) => `${index}`}
          contentContainerStyle={
            {
              // paddingTop: 16,
              // paddingBottom: 40,
              // paddingLeft: 20,
            }
          }
          showsHorizontalScrollIndicator={false}
          horizontal
          data={[...brands, ...brands, ...brands, ...brands]}
          renderItem={({ item, index }) => {
            return renderBrandCard(item.imgUrl, () => props.navigation.navigate(item.goToPage), {
              // marginRight: 8,
              marginHorizontal: 4,
              marginTop: 16,
              marginBottom: 40,
              ...(index == 0 ? { marginLeft: 20 } : {}),
            });
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSearchMedicine = (_searchText: string) => {
    setSearchText(_searchText);
    if (!(_searchText && _searchText.length > 2)) {
      setMedicineList([]);
      return;
    }
    setIsLoading(true);
    getMedicineSearchSuggestionsApi(_searchText)
      .then(({ data }) => {
        aphConsole.log({ data });
        const products = data.products || [];
        setMedicineList(products);
        setIsLoading(false);
      })
      .catch((e) => {
        aphConsole.log({ e });
        if (!Axios.isCancel(e)) {
          setIsLoading(false);
        }
      });
  };

  interface SuggestionType {
    name: string;
    price: number;
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
            <Text style={{ ...theme.viewStyles.text('M', 12, '#02475b', 0.6, 20, 0.04) }}>
              {data.price}
            </Text>
          )}
        </View>
      );
    };

    const renderIconOrImage = () => {
      return (
        <View style={localStyles.iconOrImageContainerStyle}>
          {data.imgUri ? (
            <Image
              placeholderStyle={styles.imagePlaceholderStyle}
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

    const shouldEnableSearchSend = searchText.length > 2 && medicineList.length > 0;
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

    return (
      <Input
        value={searchText}
        onChangeText={(value) => {
          onSearchMedicine(value);
        }}
        autoCorrect={false}
        rightIcon={rigthIconView}
        placeholder="Search meds, brands &amp; more"
        selectionColor="#00b38e"
        underlineColorAndroid="transparent"
        placeholderTextColor="rgba(1,48,91, 0.4)"
        inputStyle={styles.inputStyle}
        inputContainerStyle={styles.inputContainerStyle}
        rightIconContainerStyle={styles.rightIconContainerStyle}
        style={styles.style}
        containerStyle={styles.containerStyle}
      />
    );
  };

  const renderSearchSuggestionItemView = (data: ListRenderItemInfo<MedicineProduct>) => {
    const { index, item } = data;
    const imgUri = item.thumbnail ? `${config.IMAGES_BASE_URL}${item.thumbnail}` : '';
    return renderSearchSuggestionItem({
      onPress: () => {
        props.navigation.navigate(AppRoutes.MedicineDetailsScene, {
          sku: item.sku,
        });
        setSearchText('');
        setMedicineList([]);
      },
      name: item.name,
      price: item.price,
      isOutOfStock: item.is_in_stock,
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
    if (medicineList.length == 0) return null;
    return (
      <View style={{ width: '100%' }}>
        {isLoading ? (
          <View style={{ backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }}>
            {renderSectionLoader(200)}
          </View>
        ) : (
          <FlatList
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
        )}
      </View>
    );
  };

  const renderSearchSuggestionsAbsoluteView = () => {
    return (
      <View
        style={[
          medicineList.length > 0
            ? {
                width: '100%',
                height: '100%',
                position: 'absolute',
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 1,
              }
            : {},
        ]}
      />
    );
  };

  const renderSearchBarAndSuggestions = () => {
    return (
      <View style={{ height: '100%', width: '100%' }}>
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
          }}
        >
          {renderSearchSuggestions()}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ ...viewStyles.container }}>
        {renderTopView()}
        <ScrollView
          onScroll={(data) => {
            data.nativeEvent.contentOffset.x;
          }}
          style={{ flex: 1 }}
          bounces={false}
          stickyHeaderIndices={[1]}
        >
          <Text
            style={{
              ...theme.viewStyles.text('SB', 36, '#02475b', 1),
              paddingTop: 20,
              backgroundColor: '#fff',
              paddingHorizontal: 20,
            }}
          >
            {(currentPatient && currentPatient.firstName && `hi ${currentPatient.firstName}!`) ||
              ''}
          </Text>
          <View>
            <View style={{ backgroundColor: 'white' }}>{renderSearchBar()}</View>
            {renderSearchBarAndSuggestions()}
          </View>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (medicineList.length == 0 && !searchText) return;
              setSearchText('');
              setMedicineList([]);
            }}
            style={{ flex: 1 }}
          >
            {renderSearchSuggestionsAbsoluteView()}
            {renderOfferBanner()}
            {renderUploadPrescriptionSection()}
            {renderYourOrders()}
            {renderShopByHealthAreas()}
            {renderDealsOfTheDay()}
            {renderHotSellers()}
            {renderShopByCategory()}
            {renderShopByBrand()}
            {renderNeedHelp()}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      {renderEPrescriptionModal()}
      {renderUploadPrescriprionPopup()}
    </View>
  );
};
