import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { NavigationScreenProps, StackActions, NavigationActions } from 'react-navigation';

import {
  ProductPageViewedSource,
  WebEngageEvents,
  WebEngageEventName,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';

import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CartIcon, WhiteTickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  isEmptyObject,
  postWebEngageEvent,
  postAppsFlyerEvent,
  postFirebaseEvent,
  savePastSearch,
  aphConsole,
  g,
  getFormattedLocation,
  postwebEngageAddToCartEvent,
  postFirebaseAddToCartEvent,
  postAppsFlyerAddToCartEvent,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  MedicineProductDetails,
  getMedicineDetailsApi,
  trackTagalysEvent,
  getSubstitutes,
  getPlaceInfoByPincode,
  MedicineProduct,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { AppsFlyerEventName } from '@aph/mobile-patients/src/helpers/AppsFlyerEvents';
import { FirebaseEventName } from '@aph/mobile-patients/src/helpers/firebaseEvents';
import { Tagalys } from '@aph/mobile-patients/src/helpers/Tagalys';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { SEARCH_TYPE } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import { ProductNameImage } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductNameImage';
import { ProductPriceDelivery } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductPriceDelivery';
import { PincodeInput } from '@aph/mobile-patients/src/components/Medicines/Components/PicodeInput';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { ProductQuantity } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductQuantity';
import { ProductManufacturer } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductManufacturer';
import { ProductInfo } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/ProductInfo';
import { SimilarProducts } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/SimilarProducts';
import { BottomStickyComponent } from '@aph/mobile-patients/src/components/ProductDetailPage/Components/BottomStickyComponent';
import { Overlay } from 'react-native-elements';

export type ProductPageViewedEventProps = Pick<
  WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED],
  'CategoryID' | 'CategoryName' | 'SectionName'
>;

export interface ProductDetailPageProps
  extends NavigationScreenProps<{
    sku: string;
    movedFrom: ProductPageViewedSource;
    productPageViewedEventProps?: ProductPageViewedEventProps;
    deliveryError: string;
    sectionName?: string;
  }> {}

interface BreadcrumbLink {
  title: string;
  onPress?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = (props) => {
  const movedFrom = props.navigation.getParam('movedFrom');
  const sku = props.navigation.getParam('sku');
  const sectionName = props.navigation.getParam('sectionName');
  const productPageViewedEventProps = props.navigation.getParam('productPageViewedEventProps');
  const _deliveryError = props.navigation.getParam('deliveryError');

  const {
    cartItems,
    pharmacyCircleAttributes,
    setDeliveryAddressId,
    addCartItem,
  } = useShoppingCart();
  const { cartItems: diagnosticCartItems } = useDiagnosticsCart();
  const { currentPatient } = useAllCurrentPatients();
  const client = useApolloClient();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { setPharmacyLocation, locationDetails, setLocationDetails } = useAppCommonData();

  const cartItemsCount = cartItems.length + diagnosticCartItems.length;
  const scrollViewRef = React.useRef<KeyboardAwareScrollView>(null);

  const homeBreadCrumb: BreadcrumbLink = {
    title: 'Home',
    onPress: () => {
      const resetAction = StackActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({ routeName: AppRoutes.Medicine })],
      });
      props.navigation.dispatch(resetAction);
    },
  };

  //use states
  const [breadCrumbData, setBreadCrumbData] = useState<BreadcrumbLink[]>([homeBreadCrumb]);
  const [loading, setLoading] = useState<boolean>(false);
  const [medicineDetails, setMedicineDetails] = useState<MedicineProductDetails>(
    {} as MedicineProductDetails
  );
  const [medicineError, setMedicineError] = useState<string>('Product Details Not Available!');
  const [isInStock, setIsInStock] = useState<boolean>(true);
  const [deliveryError, setdeliveryError] = useState<string>(_deliveryError || '');
  const [apiError, setApiError] = useState<boolean>(false);
  const [Substitutes, setSubstitutes] = useState<MedicineProductDetails[]>([]);
  const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
  const [productQuantity, setProductQuantity] = useState<number>(1);
  const [showAddedToCart, setShowAddedToCart] = useState<boolean>(false);

  useEffect(() => {
    // set product details
    setLoading(true);
    getMedicineDetailsApi(sku)
      .then(({ data }) => {
        const productDetails = g(data, 'productdp', '0' as any);
        if (productDetails) {
          setMedicineDetails(productDetails || {});
          // console.log('medicine details: ', JSON.stringify(productDetails));
          if (productDetails?.dc_availability === 'No' && productDetails?.is_in_contract === 'No') {
            setIsInStock(false);
          }
          postProductPageViewedEvent(productDetails);
          trackTagalysViewEvent(productDetails);
          savePastSearch(client, {
            typeId: productDetails.sku,
            typeName: productDetails.name,
            type: SEARCH_TYPE.MEDICINE,
            patient: currentPatient?.id,
            image: productDetails.thumbnail,
          });

          // if (_deliveryError) {
          //   setTimeout(() => {
          //     scrollViewRef.current && scrollViewRef.current.scrollToEnd();
          //   }, 20);
          // }
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

  const fetchSubstitutes = () => {
    getSubstitutes(sku)
      .then(({ data }) => {
        try {
          if (data) {
            if (
              data.products &&
              typeof data.products === 'object' &&
              Array.isArray(data.products)
            ) {
              setSubstitutes(data.products);
              // setTimeout(() => {
              //   scrollViewRef.current && scrollViewRef.current.scrollToEnd();
              // }, 20);
            }
          }
        } catch (error) {
          CommonBugFender('MedicineDetailsScene_fetchSubstitutes_try', error);
        }
      })
      .catch((err) => {
        CommonBugFender('MedicineDetailsScene_fetchSubstitutes', err);
      });
  };

  const trackTagalysViewEvent = (details: MedicineProductDetails) => {
    try {
      trackTagalysEvent(
        {
          event_type: 'product_action',
          details: {
            sku: details.sku,
            action: 'view',
          } as Tagalys.ProductAction,
        },
        g(currentPatient, 'id')!
      );
    } catch (error) {
      CommonBugFender(`${AppRoutes.ProductDetailPage}_trackTagalysEvent`, error);
    }
  };

  const postProductPageViewedEvent = ({ sku, name, is_in_stock }: MedicineProductDetails) => {
    if (movedFrom) {
      const eventAttributes: WebEngageEvents[WebEngageEventName.PRODUCT_PAGE_VIEWED] = {
        source: movedFrom,
        ProductId: sku,
        ProductName: name,
        Stockavailability: !!is_in_stock ? 'Yes' : 'No',
        ...productPageViewedEventProps,
        ...pharmacyCircleAttributes,
      };
      postWebEngageEvent(WebEngageEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
      postAppsFlyerEvent(AppsFlyerEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
      postFirebaseEvent(FirebaseEventName.PRODUCT_PAGE_VIEWED, eventAttributes);
    }
  };

  const moveBack = () => {
    try {
      if (movedFrom === ProductPageViewedSource.REGISTRATION) {
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

  const showPincodePopup = () => {
    return showAphAlert!({
      unDismissable: false,
      removeTopIcon: true,
      children: (
        <PincodeInput
          onPressApply={(pincode) => {
            if (pincode?.length == 6) {
              hideAphAlert!();
              updatePlaceInfoByPincode(pincode);
            }
          }}
          onPressBack={() => {
            hideAphAlert!();
          }}
        />
      ),
    });
  };

  const updatePlaceInfoByPincode = (pincode: string) => {
    setLoading!(true);
    getPlaceInfoByPincode(pincode)
      .then(({ data }) => {
        try {
          if (data.results.length) {
            const addrComponents = data.results[0].address_components || [];
            const latLang = data.results[0].geometry.location || {};
            const response = getFormattedLocation(addrComponents, latLang, pincode);
            setPharmacyLocation!(response);
            setDeliveryAddressId!('');
            // updateServiceability(pincode, 'pincode');
            !locationDetails && setLocationDetails!(response);
            setLoading!(false);
          } else {
            setLoading!(false);
            showAphAlert!({
              unDismissable: true,
              title: string.common.uhOh,
              description: 'Services unavailable. Change delivery location.',
              CTAs: [
                {
                  text: 'CHANGE PINCODE',
                  type: 'orange-link',
                  onPress: () => showPincodePopup(),
                },
              ],
            });
          }
        } catch (e) {
          setLoading!(false);
          CommonBugFender('AddAddress_updateCityStateByPincode', e);
        }
      })
      .catch((e) => {
        CommonBugFender('AddAddress_updateCityStateByPincode', e);
      })
      .finally(() => setLoading!(false));
  };

  const onAddCartItem = () => {
    const {
      sku,
      mou,
      name,
      price,
      special_price,
      is_prescription_required,
      type_id,
      thumbnail,
      MaxOrderQty,
    } = medicineDetails;
    addCartItem!({
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
      quantity: productQuantity,
      thumbnail: thumbnail,
      isInStock: true,
      maxOrderQty: MaxOrderQty,
      productType: type_id,
    });
    postwebEngageAddToCartEvent(
      medicineDetails,
      'Pharmacy PDP',
      sectionName,
      '',
      pharmacyCircleAttributes!
    );
    postFirebaseAddToCartEvent(
      medicineDetails,
      'Pharmacy PDP',
      sectionName,
      '',
      pharmacyCircleAttributes!
    );
    let id = currentPatient && currentPatient.id ? currentPatient.id : '';
    postAppsFlyerAddToCartEvent(medicineDetails, id, pharmacyCircleAttributes!);
  };

  let buttonRef = React.useRef<View>(null);
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
        <Header
          leftIcon="backArrow"
          onPressLeftIcon={() => moveBack()}
          // leftComponent={
          //   <Image
          //     style={{
          //       resizeMode: 'contain',
          //       width: 40,
          //       height: 40,
          //     }}
          //     source={require('@aph/mobile-patients/src/images/apollo/splashLogo.png')}
          //   />
          // }
          // title={'PRODUCT DETAIL'}
          titleStyle={{ marginHorizontal: 10 }}
          container={{ borderBottomWidth: 0, ...theme.viewStyles.shadowStyle }}
          rightComponent={
            <TouchableOpacity
              activeOpacity={1}
              onPress={() =>
                props.navigation.navigate(
                  diagnosticCartItems.length ? AppRoutes.MedAndTestCart : AppRoutes.MedicineCart
                )
              }
              style={{ right: 20 }}
            >
              <CartIcon style={{}} />
              {cartItemsCount > 0 && (
                <View style={styles.badgelabelView}>
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
        ) : !isEmptyObject(medicineDetails) && !!medicineDetails.id ? (
          <KeyboardAwareScrollView
            ref={scrollViewRef}
            bounces={false}
            keyboardShouldPersistTaps="always"
            style={{
              paddingHorizontal: 15,
            }}
            onScroll={(event) => {
              // show bottom bar if ADD TO CART button scrolls off the screen
              buttonRef.current &&
                buttonRef.current.measure(
                  (x: any, y: any, width: any, height: any, pagex: any, pagey: any) => {
                    setShowBottomBar(pagey < 0);
                  }
                );
            }}
          >
            <Breadcrumb
              links={breadCrumbData}
              containerStyle={{ borderBottomWidth: 1, borderBottomColor: '#E5E5E5' }}
            />
            <ProductNameImage
              name={medicineDetails?.name}
              images={medicineDetails?.image}
              isPrescriptionRequired={medicineDetails?.is_prescription_required}
            />
            <ProductPriceDelivery
              price={medicineDetails?.price}
              specialPrice={medicineDetails?.special_price}
              isExpress={medicineDetails?.is_express === 'Yes'}
              isInStock={isInStock}
              manufacturer={medicineDetails?.manufacturer}
              showPincodePopup={showPincodePopup}
            />
            <View
              ref={buttonRef}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setShowBottomBar(layout.y < 0);
              }}
            >
              <ProductQuantity
                maxOrderQuantity={medicineDetails?.MaxOrderQty}
                isInStock={isInStock}
                packForm={medicineDetails?.pack_form || 'Quantity'}
                packSize={medicineDetails?.pack_size}
                unit={medicineDetails.unit_of_measurement || ''}
                sku={medicineDetails?.sku}
                onAddCartItem={onAddCartItem}
                name={medicineDetails?.name}
                productQuantity={productQuantity}
                setProductQuantity={setProductQuantity}
                setShowAddedToCart={setShowAddedToCart}
              />
            </View>
            <ProductInfo
              description={medicineDetails?.description}
              isReturnable={medicineDetails.is_returnable === 'Yes'}
            />
            {!!medicineDetails?.similar_products?.length && (
              <SimilarProducts
                typeOfProducts={'similar'}
                similarProducts={medicineDetails?.similar_products}
                navigation={props.navigation}
              />
            )}
            {!!medicineDetails?.crosssell_products?.length && (
              <SimilarProducts
                typeOfProducts={'crosssell'}
                similarProducts={medicineDetails?.crosssell_products}
                navigation={props.navigation}
              />
            )}
            {!!medicineDetails?.marketer_address && (
              <ProductManufacturer address={medicineDetails?.marketer_address} />
            )}
            <View style={{ height: 130 }} />
          </KeyboardAwareScrollView>
        ) : (
          renderEmptyData()
        )}
        {!loading && !isEmptyObject(medicineDetails) && !!medicineDetails.id && showBottomBar && (
          <BottomStickyComponent
            isInStock={isInStock}
            sku={medicineDetails?.sku}
            onAddCartItem={onAddCartItem}
            price={medicineDetails?.price}
            specialPrice={medicineDetails?.special_price}
            packForm={medicineDetails?.pack_form || 'Quantity'}
            unit={medicineDetails.unit_of_measurement || ''}
            packSize={medicineDetails?.pack_size}
            packFormVariant={medicineDetails?.dose_form_variant}
            productQuantity={productQuantity}
            setShowAddedToCart={setShowAddedToCart}
          />
        )}
      </SafeAreaView>
      {showAddedToCart && (
        <Overlay
          onRequestClose={() => {}}
          isVisible={true}
          windowBackgroundColor={'rgba(255, 255, 255, 0.6)'}
          overlayStyle={styles.overlayStyle}
        >
          <View style={styles.flexRow}>
            <WhiteTickIcon style={styles.whiteIcon} />
            <Text style={styles.overlayText}>Added to cart</Text>
          </View>
        </Overlay>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  overlayStyle: {
    padding: 0,
    width: 'auto',
    height: 'auto',
    backgroundColor: '#02475B',
    elevation: 0,
    justifyContent: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  overlayText: {
    ...theme.viewStyles.text('R', 14, '#FFFFFF', 1, 25, 0.35),
  },
  flexRow: {
    flexDirection: 'row',
  },
  whiteIcon: {
    resizeMode: 'contain',
    width: 18,
    height: 20,
    marginTop: 3,
    marginRight: 3,
  },
});
