import { BlueCross, WhiteCall } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useEffect } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CallToOrderViewProps {
  delaySeconds?: any;
  cartItems?: any;
  customMargin?: any;
  slideCallToOrder?: boolean;
  containerStyle?: any;
  cityId?: any;
  onPressSmallView?: () => void;
  onPressCross?: () => void;
}

export const CallToOrderView: React.FC<CallToOrderViewProps> = (props) => {
  const {
    cartItems,
    containerStyle,
    slideCallToOrder,
    onPressSmallView,
    onPressCross,
    customMargin,
    cityId,
  } = props;
  const callToOrderDetails = JSON.parse(
    AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER
  );
  const ctaDetailArray = callToOrderDetails?.ctaDetailsOnCityId;
  const ctaDetailMatched = ctaDetailArray?.filter((item: any) => {
    if (item?.ctaCityId == cityId) {
      return item;
    }
  });
  const phoneNumber = ctaDetailMatched?.[0]?.ctaPhoneNumber
    ? ctaDetailMatched?.[0]?.ctaPhoneNumber
    : callToOrderDetails?.ctaDetailsDefault?.ctaPhoneNumber;
  const onPressCallToOrderCta = () => {
    Linking.openURL(`tel:${phoneNumber}`);
  };
  let ctaDelaySeconds = ctaDetailMatched?.[0]?.ctaDelaySeconds;
  useEffect(() => {
    setTimeout(() => {
      ctaDelaySeconds = 0;
    }, ctaDetailMatched?.[0]?.ctaDelaySeconds);
  }, []);
  return ctaDetailMatched?.length === 1 && ctaDelaySeconds == 0 ? (
    <>
      <View style={[styles.container, containerStyle]}>
        {!slideCallToOrder ? (
          <TouchableOpacity
            style={[
              styles.fullView,
              {
                marginBottom: customMargin
                  ? customMargin
                  : !!cartItems && cartItems?.length > 0
                  ? 60
                  : 20,
              },
            ]}
            onPress={() => {
              onPressCallToOrderCta();
            }}
          >
            <WhiteCall style={styles.whiteCallIcon} />
            <Text style={styles.callToOrderText}>{string.CallToOrder.callToOrderText}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.smallView,
              {
                marginBottom: customMargin
                  ? customMargin
                  : !!cartItems && cartItems?.length > 0
                  ? 60
                  : 20,
              },
            ]}
            onPress={onPressSmallView}
          >
            <WhiteCall style={styles.whiteCallIcon} />
          </TouchableOpacity>
        )}
        <View style={styles.blueCrossView}>
          {!slideCallToOrder ? (
            <TouchableOpacity onPress={onPressCross}>
              <BlueCross style={styles.blueCrossIcon} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  callToOrderText: {
    ...theme.viewStyles.text('SB', 14, theme.colors.WHITE, 1),
    paddingHorizontal: 10,
  },
  fullView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.DARK_BLUE,
    height: 50,
    width: 150,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  smallView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.DARK_BLUE,
    height: 50,
    width: 50,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  whiteCallIcon: {
    width: 20,
    height: 20,
    paddingHorizontal: 10,
  },
  blueCrossView: { marginLeft: -10, marginTop: -10 },
  blueCrossIcon: { width: 20, height: 20 },
});
