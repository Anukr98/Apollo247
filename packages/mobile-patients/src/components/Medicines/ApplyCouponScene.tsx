import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import {
  useShoppingCart,
  ShoppingCartItem,
} from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  SearchSendIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  GET_PHARMA_COUPON_LIST,
  VALIDATE_PHARMA_COUPON,
} from '@aph/mobile-patients/src/graphql/profiles';
import {
  CouponCategoryApplicable,
  OrderLineItems,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect, useState } from 'react';
import { useApolloClient, useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import { getPharmaCouponList } from '../../graphql/types/getPharmaCouponList';
import {
  validatePharmaCoupon,
  validatePharmaCouponVariables,
} from '../../graphql/types/validatePharmaCoupon';
import { useAllCurrentPatients } from '../../hooks/authHooks';
import { useUIElements } from '../UIElementsProvider';
import { WebEngageEvents, WebEngageEventName } from '../../helpers/webEngageEvents';
import {
  fetchConsultCoupons,
  validateConsultCoupon,
} from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';

const styles = StyleSheet.create({
  bottonButtonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20, // statusBarHesight(),
    width: '66%',
    position: 'absolute',
    bottom: 0,
  },
  cardStyle: {
    ...theme.viewStyles.cardViewStyle,
    backgroundColor: theme.colors.WHITE,
    margin: 20,
    padding: 16,
  },
  separator: {
    height: 1,
    opacity: 0.1,
    backgroundColor: theme.colors.LIGHT_BLUE,
  },
  heading: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: theme.colors.LIGHT_BLUE,
    marginBottom: 8,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  radioButtonTitleDescContainer: {
    flex: 1,
    marginLeft: 16,
  },
  radioButtonTitle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    marginBottom: 4,
  },
  radioButtonDesc: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 16,
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    marginBottom: 7.5,
  },
  couponInputStyle: {
    ...theme.fonts.IBMPlexSansMedium(16),
    color: theme.colors.SHERPA_BLUE,
  },
  inputValidationStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 24,
    color: theme.colors.INPUT_FAILURE_TEXT,
    paddingTop: 8,
    letterSpacing: 0.04,
  },
});
export interface pharma_coupon {
  coupon: string;
  message: string;
}

export interface ApplyCouponSceneProps extends NavigationScreenProps {}

export const ApplyCouponScene: React.FC<ApplyCouponSceneProps> = (props) => {
  // const isTest = props.navigation.getParam('isTest');
  const [couponText, setCouponText] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  const [couponList, setcouponList] = useState<pharma_coupon[]>([]);
  const { currentPatient } = useAllCurrentPatients();
  const {
    setCoupon,
    coupon: cartCoupon,
    cartItems,
    cartTotal,
    setCouponProducts,
  } = useShoppingCart();
  const { showAphAlert } = useUIElements();
  const [loading, setLoading] = useState<boolean>(true);
  const client = useApolloClient();
  const isEnableApplyBtn = couponText.length >= 4;
  const { locationDetails } = useAppCommonData();

  useEffect(() => {
    fetchConsultCoupons()
      .then((res: any) => {
        console.log(JSON.stringify(res.data), 'objobj');
        setcouponList(res.data.response);
        setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingConsultCoupons', error);
        console.log(error);
        props.navigation.goBack();
        showAphAlert!({
          title: string.common.uhOh,
          description: "Sorry, we're unable to fetch coupon codes right now. Please try again.",
        });
      });
  }, []);

  const applyCoupon = (coupon: string, cartItems: ShoppingCartItem[]) => {
    CommonLogEvent(AppRoutes.ApplyCouponScene, 'Select coupon');
    setLoading(true);
    const data = {
      mobile: g(currentPatient, 'mobileNumber'),
      billAmount: cartTotal.toFixed(2),
      coupon: coupon,
      pinCode: locationDetails && locationDetails.pincode,
      products: cartItems.map((item) => ({
        sku: item.id,
        categoryId: item.productType,
        mrp: item.price,
        quantity: item.quantity,
        specialPrice: item.specialPrice || item.price,
      })),
    };
    validateConsultCoupon(data)
      .then((resp: any) => {
        if (resp.data.errorCode == 0) {
          if (resp.data.response.valid) {
            console.log(g(resp.data, 'response'));
            setCoupon!(g(resp.data, 'response')!);
            props.navigation.goBack();
          } else {
            setCouponError(g(resp.data, 'response', 'reason'));
          }

          const products = g(resp.data, 'response', 'products');
          if (products && products.length) {
            const freeProducts = products.filter((product) => {
              return product.couponFree === true;
            });
            setCouponProducts!(freeProducts);
          }

          const eventAttributes: WebEngageEvents[WebEngageEventName.CART_COUPON_APPLIED] = {
            'Coupon Code': coupon,
            'Discounted amount': g(resp.data, 'response', 'valid')
              ? g(resp.data, 'response', 'discount')
              : 'Not Applicable',
            'Customer ID': g(currentPatient, 'id'),
          };
          postWebEngageEvent(WebEngageEventName.CART_COUPON_APPLIED, eventAttributes);
        } else {
          CommonBugFender('validatingPharmaCoupon', g(resp.data, 'errorMsg'));
          setCouponError(g(resp.data, 'errorMsg'));
        }
      })
      .catch((error) => {
        CommonBugFender('validatingPharmaCoupon', error);
        console.log(error);
        setCouponError('Sorry, unable to validate coupon right now.');
      })
      .finally(() => setLoading!(false));
  };

  const renderBottomButtons = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!isEnableApplyBtn}
          title="APPLY COUPON"
          onPress={() => {
            CommonLogEvent(AppRoutes.ApplyCouponScene, 'Apply Coupon');
            applyCoupon(couponText, cartItems);
          }}
          style={{ flex: 1 }}
        />
      </View>
    );
  };

  const renderInputWithValidation = () => {
    const rightIconView = () => {
      return (
        !couponError && (
          <View style={{ opacity: isEnableApplyBtn ? 1 : 0.5 }}>
            <TouchableOpacity
              activeOpacity={1}
              disabled={!isEnableApplyBtn}
              onPress={() => applyCoupon(couponText, cartItems)}
            >
              <SearchSendIcon />
            </TouchableOpacity>
          </View>
        )
      );
    };

    return (
      <View style={{ paddingBottom: 24 }}>
        <TextInputComponent
          value={couponText}
          onChangeText={(text) => {
            if (/^\S*$/.test(text)) {
              couponError && setCouponError('');
              setCouponText(text);
            }
          }}
          textInputprops={{
            ...(couponError ? { selectionColor: '#e50000' } : {}),
            maxLength: 20,
          }}
          inputStyle={[
            styles.couponInputStyle,
            couponError ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter coupon code'}
          icon={rightIconView()}
        />
        {!!couponError ? (
          <Text style={styles.inputValidationStyle}>{couponError || 'Invalid Coupon Code'}</Text>
        ) : null}
      </View>
    );
  };

  const renderCardTitle = () => {
    return (
      <>
        <Text style={styles.heading}>{'Coupons For You'}</Text>
        <View style={styles.separator} />
        {!loading && couponList.length == 0 && (
          <Text
            style={{
              color: theme.colors.FILTER_CARD_LABEL,
              ...theme.fonts.IBMPlexSansMedium(13),
              margin: 20,
              textAlign: 'center',
              opacity: 0.3,
            }}
          >
            No coupons available
          </Text>
        )}
      </>
    );
  };

  const renderRadioButtonList = () => {
    return couponList.map((coupon, i) => (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.radioButtonContainer}
        key={i}
        onPress={() => setCouponText(coupon!.coupon == couponText ? '' : coupon!.coupon!)}
      >
        {coupon!.coupon == couponText ? <RadioButtonIcon /> : <RadioButtonUnselectedIcon />}
        <View style={styles.radioButtonTitleDescContainer}>
          <Text style={styles.radioButtonTitle}>{coupon!.coupon}</Text>
          <Text style={styles.radioButtonDesc}>{coupon!.message}</Text>
          <View style={styles.separator} />
        </View>
      </TouchableOpacity>
    ));
  };

  const renderCouponCard = () => {
    return (
      <View style={styles.cardStyle}>
        {renderInputWithValidation()}
        {renderCardTitle()}
        {renderRadioButtonList()}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'APPLY COUPON'}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView style={{ marginBottom: 80 }} bounces={false}>
          {renderCouponCard()}
        </ScrollView>
        {renderBottomButtons()}
        {loading && <Spinner style={{ backgroundColor: 'rgba(0,0,0, 0)' }} />}
      </SafeAreaView>
    </View>
  );
};
