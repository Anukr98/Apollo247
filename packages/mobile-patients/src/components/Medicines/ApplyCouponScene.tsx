import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  getCoupons_getCoupons_coupons,
  getCoupons_getCoupons,
  getCoupons,
} from '../../graphql/types/getCoupons';
import { Spinner } from '../ui/Spinner';
import { GET_COUPONS } from '../../graphql/profiles';

const styles = StyleSheet.create({
  bottonButtonContainer: {
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
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
  tickIconContainer: {
    position: 'absolute',
    right: 0,
  },
});

// interface CouponExtension extends Coupon {
//   description: string;
// }

// const couponsArray: CouponExtension[] = [
//   {
//     code: 'MED10',
//     description: 'Get 10% off on total bill by shopping for Rs. 500 or more',
//     type: 'unlimited',
//     discountPercentage: 10,
//     minCartValue: 500,
//   },
// ];

export interface ApplyCouponSceneProps extends NavigationScreenProps {}

export const ApplyCouponScene: React.FC<ApplyCouponSceneProps> = (props) => {
  const [couponText, setCouponText] = useState<string>('');
  const [isValidCoupon, setValidCoupon] = useState<boolean>(false);
  const { setCoupon, coupon: cartCoupon, cartTotal } = useShoppingCart();
  const [couponList, setCouponList] = useState<(getCoupons_getCoupons_coupons | null)[]>([]);
  const client = useApolloClient();
  const [loading, setLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   client.query<getCoupons>(GET_COUPONS, {});
  // });

  // const { data, error, loading } = useQuery<getCoupons>(GET_COUPONS);
  // if (!loading && !error) {
  //   console.log({ data });
  //   setCouponList(g(data, 'getCoupons', 'coupons') || []);
  // }

  const applyCoupon = (coupon: getCoupons_getCoupons_coupons) => {
    setCoupon && setCoupon(coupon);
    props.navigation.goBack();
  };

  const renderBottomButtons = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!(couponText.length > 3)}
          title="APPLY COUPON"
          onPress={() => {
            const foundCoupon = couponList.find((coupon) => coupon!.code == couponText);
            if (foundCoupon) {
              applyCoupon(foundCoupon);
            } else {
              setValidCoupon(false);
            }
          }}
          style={{ flex: 1 }}
        />
      </View>
    );
  };

  const renderInputWithValidation = () => {
    return (
      <View style={{ paddingBottom: 24 }}>
        {/*
        {isValidCoupon && (
          <View style={styles.tickIconContainer}>
            <RadioButtonIcon /> Change to tick icon once it's uploaded in assets
          </View>
        )}*/}
        <TextInputComponent
          value={couponText}
          onChangeText={(text) => {
            !isValidCoupon && setValidCoupon(true);
            setCouponText(text);
          }}
          textInputprops={{
            ...(!isValidCoupon && couponText.length > 0 ? { selectionColor: '#e50000' } : {}),
            maxLength: 6,
            autoFocus: true,
          }}
          inputStyle={[
            styles.couponInputStyle,
            !isValidCoupon && couponText.length > 0 ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter coupon code'}
          autoCorrect={false}
        />
        {!isValidCoupon && couponText.length > 0 ? (
          <Text style={styles.inputValidationStyle}>{'Invalid Coupon Code'}</Text>
        ) : null}
      </View>
    );
  };

  const renderCardTitle = () => {
    return (
      <>
        <Text style={styles.heading}>{'Coupons For You'}</Text>
        <View style={styles.separator} />
      </>
    );
  };

  const renderRadioButtonList = () => {
    return couponList.map((coupon, i) => (
      <TouchableOpacity
        activeOpacity={1}
        style={styles.radioButtonContainer}
        key={i}
        onPress={() => {
          const minimumOrderAmount = coupon!.minimumOrderAmount;
          if (minimumOrderAmount && cartTotal < minimumOrderAmount)
            Alert.alert('Error', `Minimum cart value must be ${minimumOrderAmount} or more.`);
          else applyCoupon(coupon!);
        }}
      >
        {coupon!.code == (cartCoupon && cartCoupon.code) ? (
          <RadioButtonIcon />
        ) : (
          <RadioButtonUnselectedIcon />
        )}
        <View style={styles.radioButtonTitleDescContainer}>
          <Text style={styles.radioButtonTitle}>{coupon!.code}</Text>
          <Text style={styles.radioButtonDesc}>{coupon!.description}</Text>
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
      {loading && <Spinner />}
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'APPLY COUPON'}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView bounces={false}>{renderCouponCard()}</ScrollView>
        {renderBottomButtons()}
      </SafeAreaView>
    </View>
  );
};
