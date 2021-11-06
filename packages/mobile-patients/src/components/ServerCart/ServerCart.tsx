import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
  BackHandler,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  CommonBugFender,
  CommonLogEvent,
} from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  useShoppingCart,
  ShoppingCartItem,
  PhysicalPrescription,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { FreeDelivery } from '@aph/mobile-patients/src/components/MedicineCart/Components/FreeDelivery';
import { Coupon } from '@aph/mobile-patients/src/components/MedicineCart/Components/Coupon';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Savings } from '@aph/mobile-patients/src/components/MedicineCart/Components/Savings';
import { KerbSidePickup } from '@aph/mobile-patients/src/components/MedicineCart/Components/KerbSidePickup';
import { ProceedBar } from '@aph/mobile-patients/src/components/MedicineCart/Components/ProceedBar';
import { ChooseAddress } from '@aph/mobile-patients/src/components/MedicineCart/Components/ChooseAddress';
import { useApolloClient } from 'react-apollo-hooks';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  getPatientAddressList,
  getPatientAddressListVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressList';
import {
  GET_PATIENT_ADDRESS_LIST,
  UPLOAD_DOCUMENT,
  SET_DEFAULT_ADDRESS,
  GET_ONEAPOLLO_USER,
} from '@aph/mobile-patients/src/graphql/profiles';
import { savePatientAddress_savePatientAddress_patientAddress } from '@aph/mobile-patients/src/graphql/types/savePatientAddress';
import {
  g,
  formatAddress,
  formatAddressToLocation,
  getShipmentPrice,
  validateCoupon,
  setAsyncPharmaLocation,
  getPackageIds,
  getIsMedicine,
  getNetStatus,
  isCartPriceWithInSpecifiedRange,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import {
  pinCodeServiceabilityApi247,
  availabilityApi247,
  GetTatResponse247,
  getMedicineDetailsApi,
  TatApiInput247,
  getDeliveryTAT247,
  userSpecificCoupon,
  searchPickupStoresApi,
  getProductsByCategoryApi,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { Prescriptions } from '@aph/mobile-patients/src/components/MedicineCart/Components/Prescriptions';
import { UnServiceable } from '@aph/mobile-patients/src/components/MedicineCart/Components/UnServiceable';
import { SuggestProducts } from '@aph/mobile-patients/src/components/MedicineCart/Components/SuggestProducts';
import { EmptyCart } from '@aph/mobile-patients/src/components/MedicineCart/Components/EmptyCart';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  postwebEngageProceedToPayEvent,
  PharmacyCartViewedEvent,
  PricemismatchEvent,
  postTatResponseFailureEvent,
  applyCouponClickedEvent,
  selectDeliveryAddressClickedEvent,
  uploadPrescriptionClickedEvent,
  fireCircleBuyNowEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  postPhamracyCartAddressSelectedFailure,
  postPhamracyCartAddressSelectedSuccess,
  postPharmacyAddNewAddressClick,
  postPharmacyAddNewAddressCompleted,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { uploadDocument } from '@aph/mobile-patients/src/graphql/types/uploadDocument';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { MedicineProduct } from '@aph/mobile-patients/src/helpers/apiCalls';
import moment from 'moment';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { CircleMembershipPlans } from '@aph/mobile-patients/src/components/ui/CircleMembershipPlans';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { CheckedIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { CircleCartItem } from '@aph/mobile-patients/src/components/MedicineCart/Components/CircleCartItem';
import { OneApolloCard } from '@aph/mobile-patients/src/components/MedicineCart/Components/OneApolloCard';
import AsyncStorage from '@react-native-community/async-storage';
import { MedicineOrderShipmentInput } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useFetchHealthCredits } from '@aph/mobile-patients/src/components/PaymentGateway/Hooks/useFetchHealthCredits';
import { CartHeader } from './Components/CartHeader';
import { useServerCart } from './useServerCart';
import { ApplyCircleBenefits } from './Components/ApplyCircleBenefits';
import { CartTotalSection } from './Components/CartTotalSection';
import { ServerCartItemsList } from './Components/ServerCartItemsList';
import { CouponSection } from '@aph/mobile-patients/src/components/ServerCart/Components/CouponSection';
import { ServerCartTatBottomContainer } from '@aph/mobile-patients/src/components/ServerCart/Components/ServerCartTatBottomContainer';
import { CartSavings } from '@aph/mobile-patients/src/components/ServerCart/Components/CartSavings';
import { UnServiceableMessage } from '@aph/mobile-patients/src/components/ServerCart/Components/UnServiceableMessag';

export interface ServerCartProps extends NavigationScreenProps {}

export const ServerCart: React.FC<ServerCartProps> = (props) => {
  const {
    serverCartItems,
    cartCircleSubscriptionId,
    serverCartAmount,
    addresses,
    cartAddressId,
    newAddressAdded,
    setNewAddressAdded,
    cartTat,
  } = useShoppingCart();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const { fetchServerCart, setUserActionPayload } = useServerCart();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchServerCart();
  }, []);

  useEffect(() => {
    if (addresses?.length && newAddressAdded && cartTat) {
      const newAddress = addresses.filter((value) => value.id === newAddressAdded)?.[0];
      postPharmacyAddNewAddressCompleted(
        'Cart',
        newAddress?.zipcode || '',
        formatAddress(newAddress),
        moment(cartTat, AppConfig.Configuration.MED_DELIVERY_DATE_DISPLAY_FORMAT).toDate(),
        moment(cartTat).diff(new Date(), 'd'),
        'Yes'
      );
      setUserActionPayload?.({
        patientAddressId: newAddress?.id,
        zipcode: newAddress?.zipcode,
        latitude: newAddress?.latitude,
        longitude: newAddress?.longitude,
      });
      setNewAddressAdded && setNewAddressAdded('');
    }
  }, [newAddressAdded, cartTat]);

  const renderEmptyCart = () => (
    <EmptyCart
      onPressAddMedicines={() => {
        props.navigation.navigate('MEDICINES');
      }}
    />
  );

  const renderAmountSection = () => (
    <View>
      <View style={styles.amountHeader}>
        <Text style={styles.amountHeaderText}>TOTAL CHARGES</Text>
      </View>
      <ApplyCircleBenefits navigation={props.navigation} />
      <CouponSection
        onPressApplyCoupon={() => props.navigation.navigate(AppRoutes.ViewCoupons)}
        onPressRemove={() => {
          setUserActionPayload?.({
            coupon: '',
          });
        }}
      />
      {!!serverCartAmount && <CartTotalSection />}
      <CartSavings />
    </View>
  );

  function showAddressPopup() {
    showAphAlert!({
      title: string.common.selectAddress,
      removeTopIcon: true,
      children: (
        <ChooseAddress
          addresses={addresses}
          deliveryAddressId={cartAddressId}
          onPressAddAddress={() => {
            props.navigation.navigate(AppRoutes.AddAddressNew, {
              source: 'Cart' as AddressSource,
              addOnly: true,
            });
            postPharmacyAddNewAddressClick('Cart');
            hideAphAlert!();
          }}
          onPressEditAddress={(address) => {
            props.navigation.push(AppRoutes.AddAddressNew, {
              KeyName: 'Update',
              addressDetails: address,
              ComingFrom: AppRoutes.MedicineCart,
            });
            hideAphAlert!();
          }}
          onPressSelectAddress={(address) => {
            setUserActionPayload?.({
              patientAddressId: address.id,
              zipcode: address.zipcode,
              latitude: address.latitude,
              longitude: address.longitude,
            });
            setAsyncPharmaLocation(address);
            hideAphAlert!();
          }}
        />
      ),
    });
  }

  const renderProceedBar = () => {
    return (
      <ServerCartTatBottomContainer
        showAddressPopup={showAddressPopup}
        navigation={props.navigation}
        screen={'MedicineCart'}
        onPressTatCard={() => {
          // uploadPrescriptionRequired
          //   ? redirectToUploadPrescription()
          //   : physicalPrescriptions?.length > 0
          //   ? uploadPhysicalPrescriptons()
          //   : onPressReviewOrder();
        }}
      />
    );
  };

  const renderScreen = () => (
    <>
      <UnServiceableMessage style={{ marginTop: 24 }} />
      <ServerCartItemsList
        screen={'serverCart'}
        setloading={setLoading}
        onPressProduct={(item) => {
          props.navigation.navigate(AppRoutes.ProductDetailPage, {
            urlKey: item?.url_key,
            sku: item.id,
            movedFrom: ProductPageViewedSource.CART,
          });
        }}
      />
      {renderAmountSection()}
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <CartHeader navigation={props.navigation} />
        <ScrollView
          contentContainerStyle={{
            paddingBottom: 200,
          }}
        >
          {!!serverCartItems?.length ? renderScreen() : renderEmptyCart()}
        </ScrollView>
        {!!serverCartItems?.length && renderProceedBar()}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderColor: 'rgba(2,71,91, 0.3)',
    marginHorizontal: 20,
  },
  amountHeaderText: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansBold(13),
  },
  circleApplyContainer: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#00B38E',
    borderRadius: 5,
    marginTop: 9,
    marginRight: 10,
  },
  applyText: {
    ...theme.viewStyles.text('SB', 14, '#02475B', 1, 17),
    paddingTop: 12,
  },
  useCircleText: {
    ...theme.viewStyles.text('R', 12, '#02475B', 1, 17),
    marginLeft: 25,
  },
  viewPlanContainer: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderColor: '#00B38E',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  viewPlan: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderColor: '#00B38E',
    borderWidth: 3,
    marginRight: 10,
    marginTop: 10,
  },
  viewText: {
    ...theme.viewStyles.text('M', 14, '#02475B', 1, 17),
    paddingTop: 12,
    marginRight: 5,
  },
  viewSubText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 20),
    width: '50%',
  },
});
