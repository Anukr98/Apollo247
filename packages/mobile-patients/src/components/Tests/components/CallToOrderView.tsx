import { BlueCross, WhiteCall } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CallToOrderViewProps {
  cartItems?: any;
  customMargin?: any;
  slideCallToOrder?: boolean;
  containerStyle?: any;
  onPressSmallView?: () => void;
  onPressCross?: () => void;
}

export const CallToOrderView: React.FC<CallToOrderViewProps> = (props) => {
  const { cartItems, containerStyle, slideCallToOrder, onPressSmallView, onPressCross, customMargin } = props;
  const callToOrderDetails = AppConfig.Configuration.DIAGNOSTICS_CITY_LEVEL_CALL_TO_ORDER
  const onPressCallToOrderCta = () => {
    const phoneNumber = callToOrderDetails?.ctaDetailsOnCityId ? callToOrderDetails?.ctaDetailsOnCityId?.ctaPhoneNumber : callToOrderDetails?.ctaDetailsDefault?.ctaPhoneNumber
    Linking.openURL(`tel:${phoneNumber}`)
  }
  return (
    <>
      <View style={[styles.container, containerStyle]}>
        {!slideCallToOrder ? (
          <TouchableOpacity
            style={[
              styles.fullView,
              {
                marginBottom: customMargin ? customMargin : !!cartItems && cartItems?.length > 0 ? 60 : 20,
              },
            ]}
            onPress={()=>{
              onPressCallToOrderCta()
            }}
          >
            <WhiteCall style={styles.whiteCallIcon} />
            <Text style={styles.callToOrderText}>Call to Order</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.smallView,
              {
                marginBottom: customMargin ? customMargin : !!cartItems && cartItems?.length > 0 ? 60 : 20,
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  callToOrderText: {
    ...theme.viewStyles.text('SB', 14, 'white', 1),
    paddingHorizontal: 10,
  },
  fullView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#346CD9',
    height: 50,
    width: 150,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  smallView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#346CD9',
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
  blueCrossIcon: { width: 20, height: 20 }
});
