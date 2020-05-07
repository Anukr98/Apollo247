import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  ArrowRight,
  CartIcon,
  DropdownGreen,
  MedicineIcon,
  MedicineRxIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { MaterialMenu } from '@aph/mobile-patients/src/components/ui/MaterialMenu';
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
  getDeliveryTime,
  getMedicineDetailsApi,
  getSubstitutes,
  MedicineProduct,
  MedicineProductDetails,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import {
  aphConsole,
  isEmptyObject,
  postWebEngageEvent,
  postwebEngageAddToCartEvent,
  postAppsFlyerAddToCartEvent,
  g,
  isDeliveryDateWithInXDays,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  FlatList,
  NavigationScreenProps,
  ScrollView,
  StackActions,
  NavigationActions,
} from 'react-navigation';
import stripHtml from 'string-strip-html';
import HTML from 'react-native-render-html';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import Geolocation from '@react-native-community/geolocation';
import {
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  mainView: {
    backgroundColor: theme.colors.CARD_BG,
    paddingTop: 20,
    ...theme.viewStyles.shadowStyle,
  },
  doctorNameStyle: {
    paddingTop: 8,
    paddingBottom: 2,
    ...theme.fonts.IBMPlexSansSemiBold(23),
    color: theme.colors.LIGHT_BLUE,
  },
  labelStyle: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.LIGHT_BLUE,
    paddingBottom: 3.5,
  },
  labelViewStyle: {
    marginHorizontal: 20,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...theme.viewStyles.lightSeparatorStyle,
  },
  noteContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: theme.colors.WHITE,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  noteText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, 0.6, 20, 0.04),
  },
  separatorStyle: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(2, 71, 91, 0.2)',
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.light_label,
    letterSpacing: 0.35,
    marginBottom: 2,
  },
  description: {
    ...theme.fonts.IBMPlexSansMedium(10),
    color: theme.colors.LIGHT_BLUE,
    letterSpacing: 0.25,
    marginBottom: 8,
  },
  bottomView: {
    flex: 1,
  },
  bottonButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
  },
  bottomButtonStyle: {
    flex: 1,
    backgroundColor: theme.colors.WHITE,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginTop: 15,
    marginBottom: 24,
  },
  imageView: {
    width: 80,
    height: 80,
    marginLeft: 20,
    borderRadius: 40,
    ...theme.viewStyles.shadowStyle,
    backgroundColor: theme.colors.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorImage: {
    width: 56,
    height: 56,
  },
  imagePlaceholderStyle: {
    backgroundColor: '#f0f1ec',
    borderRadius: 5,
  },
  iconOrImageContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textStyle: {
    color: '#01475b',
    ...theme.fonts.IBMPlexSansMedium(16),
    // paddingVertical: 8,
    // borderColor: theme.colors.INPUT_BORDER_SUCCESS,
    textTransform: 'capitalize',
  },
  textViewStyle: {
    borderBottomWidth: 1,
    borderColor: '#dddddd',
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgelabelView: {
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
  badgelabelText: {
    ...theme.fonts.IBMPlexSansBold(9),
    color: theme.colors.WHITE,
  },
});

export interface MedicineDetailsSceneProps
  extends NavigationScreenProps<{
    sku: string;
    title: string;
    movedFrom: string;
    deliveryError: string;
  }> {}

export const MedicineDetailsScene: React.FC<MedicineDetailsSceneProps> = (props) => {
  const _deliveryError = props.navigation.getParam('deliveryError');
  const [medicineDetails, setmedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const { locationDetails, pharmacyLocation } = useAppCommonData();
  const pharmacyPincode = g(pharmacyLocation, 'pincode') || g(locationDetails, 'pincode');

  const [apiError, setApiError] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setselectedTab] = useState<string>('');
  const [deliveryTime, setdeliveryTime] = useState<string>('');
  const [deliveryError, setdeliveryError] = useState<string>(_deliveryError || '');
  const [pincode, setpincode] = useState<string>(pharmacyPincode || '');
  const [showDeliverySpinner, setshowDeliverySpinner] = useState<boolean>(false);
  const [Substitutes, setSubstitutes] = useState<MedicineProductDetails[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [medicineError, setMedicineError] = useState<string>('Product Details Not Available!');
  const [popupHeight, setpopupHeight] = useState<number>(60);

  const { showAphAlert } = useUIElements();

  const formatTabData = (
    index: number,
    array: {
      Caption: string;
      CaptionDesc: string;
    }[]
  ) => {
    const findDesc = (key: string) =>
      (
        array.find((item) => (item.Caption || '').toLowerCase() == key.toLowerCase()) || {
          CaptionDesc: '',
        }
      ).CaptionDesc;

    return index == 0
      ? findDesc('Uses')
      : index == 1
      ? `${findDesc('How to use')}\n${findDesc('How it works')}`
      : index == 2
      ? `${findDesc('Side effects')}`
      : index == 3
      ? `${
          findDesc('DRUG ALCOHOL INTERACTION')
            ? `Alcohol:\n${findDesc('DRUG ALCOHOL INTERACTION')}\n`
            : ''
        }${
          findDesc('DRUG PREGNANCY INTERACTION')
            ? `Pregnancy:\n${findDesc('DRUG PREGNANCY INTERACTION')}\n`
            : ''
        }${
          findDesc('DRUG MACHINERY INTERACTION (DRIVING)')
            ? `Driving:\n${findDesc('DRUG MACHINERY INTERACTION (DRIVING)')}\n`
            : ''
        }${findDesc('KIDNEY') ? `Kidney:\n${findDesc('KIDNEY')}\n` : ''}${
          findDesc('LIVER') ? `Liver:\n${findDesc('LIVER')}` : ''
        }`
      : index == 4
      ? `${findDesc('DRUGS WARNINGS')}`
      : `${findDesc('STORAGE')}`;
  };

  const _medicineOverview =
    medicineDetails!.PharmaOverview &&
    medicineDetails!.PharmaOverview[0] &&
    medicineDetails!.PharmaOverview[0].Overview;
  const medicineOverview =
    typeof _medicineOverview == 'string'
      ? []
      : (
          (_medicineOverview &&
            _medicineOverview
              .filter((item) => item.Caption.length > 0 && item.CaptionDesc.length > 0)
              .map((item) => {
                const Caption =
                  item.Caption.charAt(0).toUpperCase() + item.Caption.slice(1).toLowerCase();
                return { ...item, Caption: Caption };
              })) ||
          []
        )
          .map((item, index, array) => {
            return {
              Caption:
                index == 0
                  ? 'Overview'
                  : index == 1
                  ? 'Usage'
                  : index == 2
                  ? 'Side Effects'
                  : index == 3
                  ? 'Precautions'
                  : index == 4
                  ? 'Drug Warnings'
                  : 'Storage',
              CaptionDesc: formatTabData(index, array),
            };
          })
          .slice(0, 6)
          .filter((i) => i.CaptionDesc) || [];

  const sku = props.navigation.getParam('sku'); // 'MED0017';
  aphConsole.log('SKU\n', sku);

  const { addCartItem, cartItems, updateCartItem } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const getItemQuantity = (id: string) => {
    const foundItem = cartItems.find((item) => item.id == id);
    return foundItem ? foundItem.quantity : 1;
  };
  const [selectedQuantity, setselectedQuantity] = useState<string | number>(getItemQuantity(sku));
  const isMedicineAddedToCart = cartItems.findIndex((item) => item.id == sku) != -1;
  const isOutOfStock = !medicineDetails!.is_in_stock;
  const medicineName = medicineDetails.name;
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);
  const cartItemsCount = cartItems.length + diagnosticCartItems.length;

  useEffect(() => {
    setLoading(true);
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        aphConsole.log('getMedicineDetailsApi\n', data);
        if (data && data.productdp) {
          setmedicineDetails((data && data.productdp[0]) || {});
          if (_deliveryError) {
            setTimeout(() => {
              scrollViewRef.current && scrollViewRef.current.scrollToEnd();
            }, 20);
          }
        } else if (data && data.message) {
          setMedicineError(data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        CommonBugFender('MedicineDetailsScene_getMedicineDetailsApi', err);
        aphConsole.log('MedicineDetailsScene err\n', err);
        setApiError(!!err);
        setLoading(false);
      });
    fetchSubstitutes();
  }, []);

  useEffect(() => {
    if (medicineOverview.length > 0) {
      selectedTab === '' && setselectedTab(medicineOverview[0].Caption);
    }
  }, [medicineOverview]);

  useEffect(() => {
    console.log('useEffect deliveryTime\n', { deliveryTime, deliveryError });
    if (!!deliveryTime || !!deliveryError) {
      // scrollViewRef.current && scrollViewRef.current.scrollToEnd({ animated: true });
      setTimeout(() => {
        scrollViewRef.current && scrollViewRef.current.scrollToEnd();
      }, 10);
    }
  }, [deliveryTime, deliveryError]);

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
    addCartItem!({
      id: sku,
      mou,
      name,
      price: price,
      specialPrice: special_price
        ? typeof special_price == 'string'
          ? parseInt(special_price)
          : special_price
        : undefined,
      prescriptionRequired: is_prescription_required == '1',
      isMedicine: type_id == 'Pharma',
      quantity: Number(selectedQuantity),
      thumbnail: thumbnail,
      isInStock: true,
    });
    postwebEngageAddToCartEvent(item, 'Pharmacy PDP');
    postAppsFlyerAddToCartEvent(item, 'Pharmacy PDP');
  };

  const updateQuantityCartItem = ({ sku }: MedicineProduct) => {
    updateCartItem!({
      id: sku,
      quantity: Number(selectedQuantity),
    });
  };

  const fetchDeliveryTime = () => {
    const genericErrorMsg = 'Sorry, unable to check serviceability.';
    const unServiceableMsg = 'Sorry, not serviceable in your area.';
    Keyboard.dismiss();
    setshowDeliverySpinner(true);
    getDeliveryTime({
      postalcode: pincode,
      ordertype: medicineDetails.type_id == 'Fmcg' ? 'fmcg' : 'pharma',
      lookup: [
        {
          sku: sku,
          qty: getItemQuantity(sku),
        },
      ],
    })
      .then((res) => {
        const errorMSG = g(res, 'data', 'errorMSG');
        if (errorMSG) {
          setdeliveryError(unServiceableMsg);
          return;
        }
        const deliveryDate = g(res, 'data', 'tat', '0' as any, 'deliverydate');
        if (deliveryDate) {
          if (isDeliveryDateWithInXDays(deliveryDate)) {
            setdeliveryTime(deliveryDate);
            setdeliveryError('');
          } else {
            setdeliveryError(unServiceableMsg);
            setdeliveryTime('');
          }
        } else {
          setdeliveryError(genericErrorMsg);
        }
      })
      .catch((err) => {
        CommonBugFender('MedicineDetailsScene_fetchDeliveryTime', err);
        setdeliveryError(genericErrorMsg);
      })
      .finally(() => setshowDeliverySpinner(false));
  };

  const fetchSubstitutes = () => {
    getSubstitutes(sku)
      .then(({ data }) => {
        console.log({ data });

        try {
          console.log('getSubstitutes', data);
          if (data) {
            if (
              data.products &&
              typeof data.products === 'object' &&
              Array.isArray(data.products)
            ) {
              //
              setSubstitutes(data.products);
            }
          }
        } catch (error) {
          CommonBugFender('MedicineDetailsScene_fetchSubstitutes_try', error);
          console.log(error);
        }
      })
      .catch((err) => {
        CommonBugFender('MedicineDetailsScene_fetchSubstitutes', err);
        console.log({ err });
      });
  };

  const postwebEngageNotifyMeEvent = ({ name, sku, category_id }: MedicineProduct) => {
    const eventAttributes: WebEngageEvents[WebEngageEventName.NOTIFY_ME] = {
      'product name': name,
      'product id': sku,
      Brand: '',
      'Brand ID': '',
      'category name': '',
      'category ID': category_id,
    };
    postWebEngageEvent(WebEngageEventName.NOTIFY_ME, eventAttributes);
  };

  const renderBottomButtons = () => {
    const opitons = Array.from({ length: 20 }).map((_, i) => {
      return { key: (i + 1).toString(), value: i + 1 };
    });

    return (
      <StickyBottomComponent style={{ height: 'auto' }} defaultBG>
        {isOutOfStock ? (
          <View
            style={{
              paddingTop: 8,
              paddingBottom: 16,
              alignItems: 'center',
              flex: 1,
            }}
          >
            <Text
              style={[
                theme.viewStyles.text('SB', 14, '#890000', 1, undefined, 0.35),
                { alignItems: 'center', paddingBottom: 16 },
              ]}
            >
              Out Of Stock
            </Text>
            <Button
              title={'NOTIFY WHEN IN STOCK'}
              style={{ backgroundColor: theme.colors.WHITE, width: '75%' }}
              titleTextStyle={{ color: '#fc9916' }}
              onPress={() => {
                CommonLogEvent(
                  AppRoutes.MedicineDetailsScene,
                  `You will be notified when ${medicineName} is back in stock.`
                );
                postwebEngageNotifyMeEvent(medicineDetails);
                moveBack();
                showAphAlert!({
                  title: 'Okay! :)',
                  description: `You will be notified when ${medicineName} is back in stock.`,
                });
              }}
            />
          </View>
        ) : (
          <View style={styles.bottomView}>
            <View
              style={{
                flexDirection: 'row',
                height: 50,
                alignItems: 'center',
                ...theme.viewStyles.lightSeparatorStyle,
                marginHorizontal: 20,
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <MaterialMenu
                  options={opitons}
                  selectedText={selectedQuantity!.toString()}
                  selectedTextStyle={{
                    ...theme.viewStyles.text('M', 16, '#00b38e'),
                  }}
                  onPress={(selectedQuantity) => setselectedQuantity(selectedQuantity.value)}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingRight: 8,
                      borderRightWidth: 0.5,
                      borderRightColor: 'rgba(2, 71, 91, 0.2)',
                    }}
                  >
                    <Text style={theme.viewStyles.text('SB', 14, '#02475b', 1, 24, 0.35)}>
                      QTY : {selectedQuantity}
                    </Text>
                    <DropdownGreen />
                  </View>
                </MaterialMenu>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text
                  style={[
                    theme.viewStyles.text('SB', 14, '#02475b', 1, 24, 0.35),
                    { fontWeight: 'bold' },
                  ]}
                >
                  {!!medicineDetails.special_price && (
                    <Text
                      style={[
                        {
                          textDecorationLine: 'line-through',
                          color: '#01475b',
                          opacity: 0.6,
                        },
                      ]}
                    >
                      (Rs. {medicineDetails.price})
                    </Text>
                  )}{' '}
                  <Text> Rs. {medicineDetails.special_price || medicineDetails.price}</Text>
                </Text>
              </View>
            </View>
            <View style={styles.bottonButtonContainer}>
              <Button
                onPress={() => {
                  onAddCartItem(medicineDetails);
                }}
                title={
                  loading ? 'ADD TO CART' : isMedicineAddedToCart ? 'ADDED TO CART' : 'ADD TO CART'
                }
                disabled={isMedicineAddedToCart || isOutOfStock}
                disabledStyle={styles.bottomButtonStyle}
                style={styles.bottomButtonStyle}
                titleTextStyle={{ color: '#fc9916' }}
              />
              <View style={{ width: 16 }} />
              <Button
                onPress={() => {
                  CommonLogEvent(AppRoutes.MedicineDetailsScene, 'Update quantity cart item');
                  updateQuantityCartItem(medicineDetails);
                  !isMedicineAddedToCart && onAddCartItem(medicineDetails);

                  const eventAttributes: WebEngageEvents[WebEngageEventName.BUY_NOW] = {
                    'product name': medicineDetails.name,
                    'product id': medicineDetails.sku,
                    Brand: '',
                    'Brand ID': '',
                    'category name': '',
                    'category ID': medicineDetails.category_id,
                    Price: medicineDetails.price,
                    'Discounted Price':
                      typeof medicineDetails.special_price == 'string'
                        ? Number(medicineDetails.special_price)
                        : medicineDetails.special_price,
                    Quantity:
                      typeof selectedQuantity == 'string'
                        ? Number(selectedQuantity)
                        : selectedQuantity,
                    'Service Area': 'Pharmacy',
                  };
                  postWebEngageEvent(WebEngageEventName.BUY_NOW, eventAttributes);
                  props.navigation.navigate(AppRoutes.YourCart, { isComingFromConsult: true });
                }}
                title="BUY NOW"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        )}
      </StickyBottomComponent>
    );
  };

  const renderNote = () => {
    if (medicineDetails!.is_prescription_required == '1') {
      return (
        <>
          <View style={styles.noteContainerStyle}>
            <Text style={styles.noteText}>This medicine requires doctor’s prescription</Text>
            <MedicineRxIcon />
          </View>
          {/* <View style={styles.separator} /> */}
        </>
      );
    } else {
      return <View style={[styles.separatorStyle, { marginTop: 4 }]} />;
    }
  };

  const renderTopView = () => {
    return (
      <View style={styles.mainView}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.doctorNameStyle}>{medicineDetails.name}</Text>
            {renderBasicDetails()}
          </View>
          <View>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.imageView}
              onPress={() =>
                !!medicineDetails.image
                  ? props.navigation.navigate(AppRoutes.ImageSliderScreen, {
                      images: [AppConfig.Configuration.IMAGES_BASE_URL[0] + medicineDetails.image],
                      heading: medicineDetails.name,
                    })
                  : {}
              }
            >
              {!!medicineDetails.image ? (
                <Image
                  source={{
                    uri: AppConfig.Configuration.IMAGES_BASE_URL[0] + medicineDetails.image,
                  }}
                  style={styles.doctorImage}
                />
              ) : (
                renderIconOrImage(medicineDetails)
              )}
            </TouchableOpacity>
            {!!medicineDetails.image && (
              <View style={{ alignItems: 'center' }}>
                <Text
                  style={[
                    theme.viewStyles.text('SB', 8, '#0087ba', 1, undefined, 0.2),
                    { paddingTop: 8, marginLeft: 20 },
                  ]}
                >
                  1 PHOTO
                </Text>
              </View>
            )}
          </View>
        </View>
        {renderNote()}
        {medicineOverview.length === 0 ? renderInfo() : null}
      </View>
    );
  };

  const filterHtmlContent = (content: string = '') => {
    return stripHtml(content);
    // .replace(/&amp;nbsp;/g, ' ')
    // .replace(/&amp;deg;/g, '°')
    // .replace(/&#039;/g, "'")
    // .replace(/&amp;lt;br \/&amp;gt;. /g, '\n')
    // .replace(/&amp;lt;br \/&amp;gt;/g, '\n')
    // .split('\n')
    // .filter((item) => item)
    // .join('\n')
    // .trim();
  };

  const renderTabComponent = () => {
    // let description = desc; // props.route.key; //data.CaptionDesc;
    const selectedTabdata = medicineOverview.filter((item) => item.Caption === selectedTab);
    let description =
      selectedTabdata.length && !!selectedTabdata[0].CaptionDesc
        ? selectedTabdata[0].CaptionDesc
        : '';
    description = description
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/\.t/g, '.');

    return (
      <View
        style={[
          {
            backgroundColor: theme.colors.WHITE,
            flex: 1,
            padding: 20,
            ...theme.viewStyles.shadowStyle,
          },
        ]}
      >
        <View>
          {!!description && (
            <HTML
              html={description}
              baseFontStyle={{
                ...theme.viewStyles.text('M', 14, '#0087ba', 1, 22),
              }}
              imagesMaxWidth={Dimensions.get('window').width}
            />
          )}
        </View>
      </View>
    );
  };

  const renderTabs = () => {
    const data = medicineOverview.map((item) => {
      return {
        title: item.Caption,
      };
    });

    return (
      <>
        <TabsComponent
          data={data}
          selectedTab={selectedTab}
          onChange={(selectedTab) => setselectedTab(selectedTab)}
          scrollable={true}
          tabViewStyle={{ width: 'auto' }}
          selectedTitleStyle={theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE)}
          titleStyle={theme.viewStyles.text('M', 14, theme.colors.LIGHT_BLUE)}
        />
        {renderTabComponent()}
      </>
    );
  };

  const renderInfo = () => {
    const description = medicineDetails.description
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;rn/g, '>')
      .replace(/&gt;r/g, '>')
      .replace(/&gt;/g, '>')
      .replace(/\.t/, '.');
    console.log(description);

    if (!!description)
      return (
        <View>
          <Text
            style={{
              ...theme.viewStyles.text('SB', 14, theme.colors.LIGHT_BLUE, 1),
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 17,
            }}
          >
            Product Information
          </Text>
          <View
            style={[
              {
                backgroundColor: theme.colors.WHITE,
                flex: 1,
                padding: 20,
                ...theme.viewStyles.shadowStyle,
              },
            ]}
          >
            <View>
              <HTML
                html={description}
                baseFontStyle={{
                  ...theme.viewStyles.text('M', 14, '#0087ba', 1),
                }}
                imagesMaxWidth={Dimensions.get('window').width}
              />
            </View>
          </View>
        </View>
      );
  };

  const renderIconOrImage = (data: MedicineProductDetails) => {
    return (
      <View style={styles.iconOrImageContainerStyle}>
        {data.image ? (
          <Image
            placeholderStyle={styles.imagePlaceholderStyle}
            source={{ uri: AppConfig.Configuration.IMAGES_BASE_URL[0] + data.image }}
            style={{ height: 40, width: 40 }}
            resizeMode="contain"
          />
        ) : data.is_prescription_required ? (
          <MedicineRxIcon />
        ) : (
          <MedicineIcon />
        )}
      </View>
    );
  };

  const renderSubstitutes = () => {
    const localStyles = StyleSheet.create({
      containerStyle: {},
      iconAndDetailsContainerStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
    });

    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>SUBSTITUTE DRUGS</Text>
        </View>
        <View style={styles.cardStyle}>
          <TouchableOpacity activeOpacity={1} onPress={() => setShowPopup(true)}>
            <View style={localStyles.containerStyle}>
              <View style={localStyles.iconAndDetailsContainerStyle}>
                <Text style={{ ...theme.viewStyles.text('M', 17, '#01475b', 1, 24, 0) }}>
                  {`Pick from ${Substitutes.length} available substitute${
                    Substitutes.length > 1 ? 's' : ''
                  }`}
                </Text>
                <DropdownGreen />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderDeliveryView = () => {
    return (
      <View>
        <View style={styles.labelViewStyle}>
          <Text style={styles.labelStyle}>CHECK DELIVERY TIME</Text>
        </View>
        <View
          style={[
            styles.cardStyle,
            {
              margin: 20,
              padding: 0,
            },
          ]}
        >
          <View
            style={{
              padding: 16,
              paddingBottom: 3,
              paddingTop: 10,
            }}
          >
            <TextInputComponent
              placeholder={'Enter Pin Code'}
              value={pincode}
              onChangeText={(pincode) => {
                if (/^\d+$/.test(pincode) || pincode == '') {
                  setpincode(pincode);
                  setdeliveryError('');
                  setdeliveryTime('');
                }
              }}
              maxLength={6}
              keyboardType="numeric"
            />
            <View
              style={{
                position: 'absolute',
                right: 16,
                top: 10,
              }}
            >
              <Text
                style={[
                  theme.viewStyles.yellowTextStyle,
                  { opacity: pincode.length === 6 ? 1 : 0.21, padding: 5 },
                ]}
                onPress={() => (pincode.length === 6 ? fetchDeliveryTime() : {})}
                suppressHighlighting={pincode.length !== 6}
              >
                CHECK
              </Text>
            </View>

            {!!deliveryTime ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}
              >
                <Text style={theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0)}>
                  Delivery Time
                </Text>
                <Text
                  style={[
                    theme.viewStyles.text('M', 14, '#01475b', 1, 24, 0),
                    { fontWeight: 'bold' },
                  ]}
                >
                  By {moment(deliveryTime.split(' ')[0]).format('Do MMM YYYY')}
                </Text>
              </View>
            ) : !!deliveryError ? (
              <Text style={[theme.viewStyles.text('R', 10, '#890000'), { marginBottom: 6 }]}>
                {deliveryError}
              </Text>
            ) : null}
          </View>
          {showDeliverySpinner && <Spinner style={{ backgroundColor: 'transparent' }} />}
        </View>
      </View>
    );
  };

  const formatComposition = (value: string) => {
    return value
      ? value.indexOf('+') > -1
        ? value.split('+').map((item) => item.trim())
        : [value]
      : [];
  };

  const renderBasicDetails = () => {
    if (!loading && !apiError) {
      let composition = '';
      const description = medicineDetails.name;
      const pack = medicineDetails.mou;
      const price = medicineDetails.price;
      const pharmaOverview =
        (medicineDetails!.PharmaOverview && medicineDetails!.PharmaOverview[0]) || {};
      const doseForm = pharmaOverview.Doseform || '';
      const manufacturer = medicineDetails.manufacturer || '';
      const _composition = {
        generic: formatComposition(pharmaOverview.generic),
        unit: formatComposition(pharmaOverview.Unit),
        strength: formatComposition(pharmaOverview.Strength || pharmaOverview.Strengh),
      };

      composition = [...Array.from({ length: _composition.generic.length })]
        .map(
          (_, index) =>
            `${_composition.generic[index]}-${_composition.strength[index]}${_composition.unit[index]}`
        )
        .join('+');

      const basicDetails: [string, string | number][] = [
        ['Manufacturer', manufacturer],
        ['Composition', composition],
        // ['Dose Form', doseForm],
        // ['Description', description],
        // ['Price', price],
        ['Pack Of', `${pack} ${doseForm}${Number(pack) !== 1 ? 'S' : ''}`],
      ];

      return (
        <>
          {basicDetails.map(
            (item, i, array) =>
              !!item[1] && (
                <View key={i}>
                  <Text style={styles.heading}>{item[0]}</Text>
                  <Text style={[styles.description]}>{item[1]}</Text>
                </View>
              )
          )}
          {!loading && medicineOverview.length != 0 ? <View style={styles.separator} /> : null}
        </>
      );
    }
  };

  const Popup = () => (
    <TouchableOpacity
      activeOpacity={1}
      style={{
        paddingVertical: 9,
        position: 'absolute',
        width: width,
        height: height,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
        backgroundColor: 'transparent',
      }}
      onPress={() => setShowPopup(false)}
    >
      <View
        style={{
          borderRadius: 10,
          backgroundColor: 'white',
          marginRight: 20,
          shadowColor: '#808080',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 5,
          marginLeft: 72,
          maxHeight: height - 200,
          // overflow: 'scroll',
          height: popupHeight + 24,
          ...theme.viewStyles.shadowStyle,
        }}
      >
        <View>
          <ScrollView
            bounces={false}
            contentContainerStyle={{
              paddingBottom: 16,
              paddingTop: 8,
            }}
          >
            <FlatList
              bounces={false}
              data={Substitutes}
              onEndReachedThreshold={0.5}
              renderItem={({ item, index }) => (
                <View
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setpopupHeight(height * Substitutes.length);
                  }}
                >
                  <TouchableOpacity
                    style={styles.textViewStyle}
                    onPress={() => {
                      CommonLogEvent(
                        AppRoutes.MedicineDetailsScene,
                        'Navigate to Medicine Details scene with sku'
                      );
                      props.navigation.push(AppRoutes.MedicineDetailsScene, {
                        sku: item.sku,
                        title: item.name,
                      });
                      setShowPopup(false);
                    }}
                  >
                    <View style={{ marginVertical: 7.5 }}>
                      <Text style={styles.textStyle}>{item.name}</Text>
                      {!!item.price && (
                        <Text style={theme.viewStyles.text('M', 12, '#02475b', 1, 20, 0.004)}>
                          RS. {item.price}
                        </Text>
                      )}
                    </View>
                    <ArrowRight />
                  </TouchableOpacity>
                </View>
              )}
            />
          </ScrollView>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyData = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Card
          cardContainer={{ marginTop: 0 }}
          heading={'Uh oh! :('}
          description={medicineError || 'Product Details Not Available!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      </View>
    );
  };

  const moveBack = () => {
    try {
      const MoveDoctor = props.navigation.getParam('movedFrom') || '';

      console.log('MoveDoctor', MoveDoctor);
      if (MoveDoctor === 'registration') {
        props.navigation.dispatch(
          StackActions.reset({
            index: 0,
            key: null,
            actions: [
              NavigationActions.navigate({
                routeName: AppRoutes.ConsultRoom,
              }),
            ],
          })
        );
      } else {
        props.navigation.goBack();
      }
    } catch (error) {}
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          onPressLeftIcon={() => moveBack()}
          title={'PRODUCT DETAIL'}
          titleStyle={{ marginHorizontal: 10 }}
          container={{ borderBottomWidth: 0, ...theme.viewStyles.shadowStyle }}
          rightComponent={
            <TouchableOpacity
              activeOpacity={1}
              onPress={() =>
                props.navigation.navigate(AppRoutes.MedAndTestCart, { isComingFromConsult: true })
              }
              style={{ right: 20 }}
            >
              <CartIcon style={{}} />
              {cartItemsCount > 0 && (
                <View style={[styles.badgelabelView]}>
                  <Text style={styles.badgelabelText}>{cartItemsCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          }
        />

        {loading ? (
          <ActivityIndicator
            style={{ flex: 1, alignItems: 'center' }}
            animating={loading}
            size="large"
            color="green"
          />
        ) : !isEmptyObject(medicineDetails) && !!medicineDetails.sku ? (
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            bounces={false}
            keyboardShouldPersistTaps="always"
          >
            {renderTopView()}
            {medicineOverview.length > 0 && renderTabs()}
            {Substitutes.length ? renderSubstitutes() : null}
            {!isOutOfStock && renderDeliveryView()}
            <View style={{ height: 130 }} />
          </KeyboardAwareScrollView>
        ) : (
          renderEmptyData()
        )}
        {!loading &&
          !isEmptyObject(medicineDetails) &&
          !!medicineDetails.sku &&
          renderBottomButtons()}
      </SafeAreaView>
      {showPopup && Popup()}
    </View>
  );
};
