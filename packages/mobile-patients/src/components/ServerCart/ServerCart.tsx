import React, { useEffect, useState } from 'react';
import { NavigationScreenProps } from 'react-navigation';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
  BackHandler,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import {
  formatAddress,
  setAsyncPharmaLocation,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { AddressSource } from '@aph/mobile-patients/src/components/AddressSelection/AddAddressNew';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import {
  PharmacyCartViewedEvent,
  applyCouponClickedEvent,
  uploadPrescriptionClickedEvent,
} from '@aph/mobile-patients/src/components/MedicineCart/Events';
import {
  postPhamracyCartAddressSelectedFailure,
  postPhamracyCartAddressSelectedSuccess,
  postPharmacyAddNewAddressClick,
  postPharmacyAddNewAddressCompleted,
} from '@aph/mobile-patients/src/helpers/webEngageEventHelpers';
import { ProductPageViewedSource } from '@aph/mobile-patients/src/helpers/webEngageEvents';
import moment from 'moment';
import {
  makeAdressAsDefaultVariables,
  makeAdressAsDefault,
} from '@aph/mobile-patients/src/graphql/types/makeAdressAsDefault';
import { CartHeader } from '@aph/mobile-patients/src/components/ServerCart/Components/CartHeader';
import { useServerCart } from '@aph/mobile-patients/src/components/ServerCart/useServerCart';
import { ApplyCircleBenefits } from '@aph/mobile-patients/src/components/ServerCart/Components/ApplyCircleBenefits';
import { CartTotalSection } from '@aph/mobile-patients/src/components/ServerCart/Components/CartTotalSection';
import { ServerCartItemsList } from '@aph/mobile-patients/src/components/ServerCart/Components/ServerCartItemsList';
import { CouponSection } from '@aph/mobile-patients/src/components/ServerCart/Components/CouponSection';
import { ServerCartTatBottomContainer } from '@aph/mobile-patients/src/components/ServerCart/Components/ServerCartTatBottomContainer';
import { CartSavings } from '@aph/mobile-patients/src/components/ServerCart/Components/CartSavings';
import { UnServiceableMessage } from '@aph/mobile-patients/src/components/ServerCart/Components/UnServiceableMessag';
import { CartCircleItem } from '@aph/mobile-patients/src/components/ServerCart/Components/CartCircleItem';
import { CartPrescriptions } from '@aph/mobile-patients/src/components/ServerCart/Components/CartPrescriptions';
import { CartSuggestProducts } from '@aph/mobile-patients/src/components/ServerCart/Components/CartSuggestedProducts';
import { HealthCreditsCard } from '@aph/mobile-patients/src/components/ServerCart/Components/HealthCreditsCard';
import { KerbSidePickup } from '@aph/mobile-patients/src/components/ServerCart/Components/KerbSidePickup';
import { ChooseAddress } from '@aph/mobile-patients/src/components/ServerCart/Components/ChooseAddress';
import { EmptyCart } from '@aph/mobile-patients/src/components/ServerCart/Components/EmptyCart';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { saveCart_saveCart_data_medicineOrderCartLineItems } from '@aph/mobile-patients/src/graphql/types/saveCart';
import { FreeDelivery } from '@aph/mobile-patients/src/components/ServerCart/Components/FreeDelivery';

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
    cartSubscriptionDetails,
    isCartPrescriptionRequired,
    cartSuggestedProducts,
    serverCartLoading,
    pharmacyCircleAttributes,
    serverCartErrorMessage,
    setServerCartErrorMessage,
  } = useShoppingCart();
  const shoppingCart = useShoppingCart();
  const { pharmacyUserTypeAttribute } = useAppCommonData();
  const { showAphAlert, hideAphAlert } = useUIElements();
  const {
    fetchServerCart,
    setUserActionPayload,
    fetchAddress,
    fetchProductSuggestions,
  } = useServerCart();
  const [loading, setLoading] = useState<boolean>(false);
  const { currentPatient } = useAllCurrentPatients();

  const circlePlanAddedToCart =
    !!cartSubscriptionDetails?.currentSellingPrice &&
    !cartCircleSubscriptionId &&
    cartSubscriptionDetails?.subscriptionApplied;
  const selectedAddress = addresses.find((item) => item.id == cartAddressId);

  useEffect(() => {
    fetchServerCart();
    if (!addresses?.length) fetchAddress();
    if (!cartSuggestedProducts?.length) fetchProductSuggestions();
    firePharmacyCartViewedEvent();
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

  useEffect(() => {
    if (serverCartErrorMessage) {
      hideAphAlert?.();
      showAphAlert!({
        unDismissable: true,
        title: 'Hey',
        description: serverCartErrorMessage,
        titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
        ctaContainerStyle: { justifyContent: 'flex-end' },
        CTAs: [
          {
            text: 'OKAY',
            type: 'orange-link',
            onPress: () => {
              setServerCartErrorMessage?.('');
              hideAphAlert?.();
            },
          },
        ],
      });
    }
  }, [serverCartErrorMessage]);

  useEffect(() => {
    if (!serverCartLoading) {
      const unserviceableItems = serverCartItems?.filter(
        (item) => !item?.isShippable || !item?.sellOnline
      );
      if (unserviceableItems?.length) {
        showUnServiceableItemsAlert(unserviceableItems);
      }
    }
  }, [serverCartItems]);

  const showUnServiceableItemsAlert = (
    unserviceableCartItems: saveCart_saveCart_data_medicineOrderCartLineItems[]
  ) => {
    showAphAlert?.({
      title: string.medicine_cart.tatUnServiceableAlertTitle,
      description: string.medicine_cart.tatUnServiceableAlertDesc,
      titleStyle: theme.viewStyles.text('SB', 18, '#890000'),
      CTAs: [
        {
          text: string.medicine_cart.tatUnServiceableAlertChangeCTA,
          type: 'orange-link',
          onPress: showAddressPopup,
        },
        {
          text: string.medicine_cart.tatUnServiceableAlertRemoveCTA,
          type: 'orange-link',
          onPress: () => removeUnServiceableItems(unserviceableCartItems),
        },
      ],
    });
  };

  const removeUnServiceableItems = (
    unserviceableCartItems: saveCart_saveCart_data_medicineOrderCartLineItems[]
  ) => {
    hideAphAlert?.();
    unserviceableCartItems?.forEach((item) => {
      setUserActionPayload?.({
        medicineOrderCartLineItems: {
          medicineSKU: item.sku,
          quantity: 0,
        },
      });
    });
  };

  const firePharmacyCartViewedEvent = () => {
    serverCartItems?.length &&
      PharmacyCartViewedEvent(
        shoppingCart,
        currentPatient?.id,
        pharmacyCircleAttributes!,
        pharmacyUserTypeAttribute!
      );
  };

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
              ComingFrom: AppRoutes.ServerCart,
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

  const onPressUploadPrescription = () => {
    uploadPrescriptionClickedEvent(currentPatient?.id);
    props.navigation.navigate(AppRoutes.MedicineCartPrescription);
  };

  const onPressApplyCoupon = () => {
    if (cartAddressId) {
      setUserActionPayload?.({
        coupon: '',
        subscription: {
          subscriptionApplied: cartCircleSubscriptionId ? true : false,
        },
      });
      applyCouponClickedEvent(currentPatient?.id, JSON.stringify(serverCartItems));
      props.navigation.navigate(AppRoutes.ViewCoupons);
    }
  };

  const onPressRemoveCoupon = () => {
    setUserActionPayload?.({
      coupon: '',
      subscription: {
        subscriptionApplied: cartCircleSubscriptionId ? true : false,
      },
    });
  };

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
        onPressApplyCoupon={onPressApplyCoupon}
        onPressRemove={onPressRemoveCoupon}
        movedFrom={'pharmacy'}
      />
      {!!serverCartAmount && <CartTotalSection />}
      <CartSavings />
    </View>
  );

  const renderProceedBar = () => {
    return (
      <ServerCartTatBottomContainer
        showAddressPopup={showAddressPopup}
        navigation={props.navigation}
        screen={'MedicineCart'}
        onPressTatCard={() => {
          !cartAddressId || !selectedAddress
            ? addresses?.length
              ? showAddressPopup()
              : onPressAddDeliveryAddress()
            : isCartPrescriptionRequired
            ? onPressUploadPrescription()
            : props.navigation.navigate(AppRoutes.ReviewCart);
        }}
      />
    );
  };

  const onPressAddDeliveryAddress = () => {
    props.navigation.navigate(AppRoutes.AddAddressNew, {
      source: 'Cart' as AddressSource,
      addOnly: true,
    });
    postPharmacyAddNewAddressClick('Cart');
  };

  const renderPrescriptions = () => {
    return (
      <CartPrescriptions
        onPressUploadMore={() => {
          props.navigation.navigate(AppRoutes.MedicineCartPrescription);
        }}
        style={{ marginTop: 20 }}
        actionType={'removal'}
      />
    );
  };

  const renderSuggestProducts = () => <CartSuggestProducts navigation={props.navigation} />;

  const renderOneApolloHealthCredits = () => <HealthCreditsCard />;

  const renderUnserviceableMessage = () => <UnServiceableMessage style={{ marginTop: 24 }} />;

  const renderServerCartItemsList = () => (
    <ServerCartItemsList
      screen={'serverCart'}
      setloading={setLoading}
      onPressProduct={(item) => {
        props.navigation.navigate(AppRoutes.ProductDetailPage, {
          urlKey: item?.urlKey,
          sku: item.id,
          movedFrom: ProductPageViewedSource.CART,
        });
      }}
    />
  );

  const renderCircleCartItem = () => <CartCircleItem />;

  const renderAvailFreeDelivery = () => <FreeDelivery />;

  const renderKerbSidePickup = () => (
    <KerbSidePickup
      onPressProceed={() => {
        props.navigation.navigate(AppRoutes.StorePickup);
      }}
    />
  );

  const renderScreen = () => (
    <>
      {renderUnserviceableMessage()}
      {renderServerCartItemsList()}
      {circlePlanAddedToCart && renderCircleCartItem()}
      {/* {renderAvailFreeDelivery()} */}
      {renderAmountSection()}
      {renderOneApolloHealthCredits()}
      {renderPrescriptions()}
      {renderSuggestProducts()}
      {renderKerbSidePickup()}
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
          {serverCartLoading && <Spinner />}
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
