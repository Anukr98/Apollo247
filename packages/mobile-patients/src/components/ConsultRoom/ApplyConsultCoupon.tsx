import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState, useEffect } from 'react';
import { SafeAreaView, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';
import {
  RadioButtonIcon,
  RadioButtonUnselectedIcon,
  SearchSendIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { fetchConsultCoupons } from '@aph/mobile-patients/src/helpers/apiCalls';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { useAppCommonData } from '../AppCommonDataProvider';
import { g, getPackageIds } from '../../helpers/helperFunctions';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';

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
  noCoupons: {
    color: theme.colors.FILTER_CARD_LABEL,
    ...theme.fonts.IBMPlexSansMedium(13),
    margin: 20,
    textAlign: 'center',
    opacity: 0.3,
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
});

export interface consult_coupon {
  coupon: string;
  message: string;
}

export interface ApplyConsultCouponProps
  extends NavigationScreenProps<{
    onApplyCoupon: (value: string) => Promise<void>;
    coupon: string;
  }> {}

export const ApplyConsultCoupon: React.FC<ApplyConsultCouponProps> = (props) => {
  const onApplyCoupon = props.navigation.getParam('onApplyCoupon');
  const coupon = props.navigation.getParam('coupon');
  const [couponText, setCouponText] = useState<string>(coupon || '');
  const [isValidCoupon, setValidCoupon] = useState<boolean>(true);
  const [couponInvalidReason, setCouponInvalidReason] = useState<string>('');
  const [couponList, setcouponList] = useState<consult_coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [validating, setValidating] = useState<boolean>(false);
  const { showAphAlert } = useUIElements();
  const { activeUserSubscriptions } = useAppCommonData();
  const { currentPatient } = useAllCurrentPatients();

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  useEffect(() => {
    const data = {
      packageId: activeUserSubscriptions ? getPackageIds(activeUserSubscriptions)?.join() : '',
      mobile: g(currentPatient, 'mobileNumber'),
      email: g(currentPatient, 'emailAddress'),
      type: 'Consult',
    };
    fetchConsultCoupons(data)
      .then((res: any) => {
        setcouponList(res.data.response);
        setLoading(false);
      })
      .catch((error) => {
        CommonBugFender('fetchingConsultCoupons', error);
        props.navigation.goBack();
        renderErrorPopup(string.common.tryAgainLater);
      });
  }, []);

  const applyCoupon = (coupon: string) => {
    setValidating!(true);
    // calling the passed function from prev. screen to validate coupon
    onApplyCoupon(coupon)
      .then(() => {
        props.navigation.goBack();
      })
      .catch((reason?: string) => {
        setValidCoupon(false);
        setCouponInvalidReason(
          typeof reason == 'string' && reason
            ? reason
            : 'Oops! seems like we are having an issue. Please try again.'
        );
      })
      .finally(() => setValidating!(false));
  };

  const renderBottomButtons = () => {
    return (
      <View style={styles.bottonButtonContainer}>
        <Button
          disabled={!isCouponTextValid(couponText)}
          title="APPLY COUPON"
          onPress={() => {
            CommonLogEvent(AppRoutes.ApplyConsultCoupon, 'Apply Coupon');
            applyCoupon(couponText);
          }}
          style={{ flex: 1 }}
        />
      </View>
    );
  };

  const isCouponTextValid = (couponText: string) => {
    if (couponText.length > 3 && couponText.length < 21) {
      return true;
    } else {
      return false;
    }
  };

  const rightIcon = () => {
    return (
      <View style={{ opacity: isCouponTextValid(couponText) ? 1 : 0.5 }}>
        <TouchableOpacity
          activeOpacity={1}
          disabled={!isCouponTextValid(couponText)}
          onPress={() => applyCoupon(couponText)}
        >
          <SearchSendIcon />
        </TouchableOpacity>
      </View>
    );
  };

  const renderInputWithValidation = () => {
    return (
      <View style={{ paddingBottom: 24 }}>
        <TextInputComponent
          value={couponText}
          onChangeText={(text) => {
            !isValidCoupon && setValidCoupon(true);
            setCouponText(text);
          }}
          textInputprops={{
            ...(!isValidCoupon && couponText.length > 0 ? { selectionColor: '#e50000' } : {}),
            maxLength: 20,
            autoCapitalize: 'characters',
          }}
          inputStyle={[
            styles.couponInputStyle,
            !isValidCoupon && couponText.length > 0 ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter coupon code'}
          icon={rightIcon()}
        />
        {!isValidCoupon && couponText.length > 0 ? (
          <Text style={styles.inputValidationStyle}>
            {couponInvalidReason || 'Invalid Coupon Code'}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderCardTitle = () => {
    return (
      <>
        <Text style={styles.heading}>{'Coupons For You'}</Text>
        <View style={styles.separator} />
        {loading ? (
          <View style={{ marginVertical: 50 }}>
            <Spinner style={{ backgroundColor: 'rgba(0,0,0, 0)' }} />
          </View>
        ) : (
          couponList.length == 0 && <Text style={styles.noCoupons}>No coupons available</Text>
        )}
      </>
    );
  };

  const renderRadioButtonList = () => {
    return (
      <View>
        {couponList.map((coupon, i) => (
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
        ))}
      </View>
    );
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
        <View style={{ flex: 1 }}>
          <ScrollView bounces={false}>{renderCouponCard()}</ScrollView>
          {renderBottomButtons()}
        </View>
        {validating && <Spinner style={{ backgroundColor: 'rgba(0,0,0, 0)' }} />}
      </SafeAreaView>
    </View>
  );
};
