import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { CommonLogEvent } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { NavigationScreenProps, ScrollView } from 'react-navigation';

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
});

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
  const { setLoading } = useUIElements();

  const applyCoupon = (coupon: string) => {
    setLoading!(true);
    // calling the passed function from prev. screen to validate coupon
    onApplyCoupon(coupon)
      .then(() => {
        props.navigation.goBack();
      })
      .catch((reason?: string) => {
        setValidCoupon(false);
        setCouponInvalidReason(reason || '');
      })
      .finally(() => setLoading!(false));
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

  const isCouponTextValid = (couponText: string) => /^[a-zA-Z0-9]{5,15}$/.test(couponText);

  const renderInputWithValidation = () => {
    return (
      <View>
        <TextInputComponent
          value={couponText}
          onChangeText={(text) => {
            !isValidCoupon && setValidCoupon(true);
            setCouponText(text);
          }}
          textInputprops={{
            ...(!isValidCoupon && couponText.length > 0 ? { selectionColor: '#e50000' } : {}),
            maxLength: 15,
            autoFocus: true,
          }}
          inputStyle={[
            styles.couponInputStyle,
            !isValidCoupon && couponText.length > 0 ? { borderBottomColor: '#e50000' } : {},
          ]}
          conatinerstyles={{ paddingBottom: 0 }}
          placeholder={'Enter coupon code'}
        />
        {!isValidCoupon && couponText.length > 0 ? (
          <Text style={styles.inputValidationStyle}>
            {couponInvalidReason || 'Invalid Coupon Code'}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderCouponCard = () => {
    return <View style={styles.cardStyle}>{renderInputWithValidation()}</View>;
  };

  const keyboardVerticalOffset = Platform.OS === 'android' ? { keyboardVerticalOffset: 20 } : {};

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={'APPLY COUPON'}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <KeyboardAvoidingView
          behavior={'padding'}
          style={{ flex: 1 }}
          {...keyboardVerticalOffset}
          enabled
        >
          <View style={{ flex: 1 }}>
            <ScrollView bounces={false}>{renderCouponCard()}</ScrollView>
            {renderBottomButtons()}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};
