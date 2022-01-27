import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CrossPopup, CopyIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { Overlay } from 'react-native-elements';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { colors } from '@aph/mobile-patients/src/theme/colors';

const { width } = Dimensions.get('window');

interface CircleBenefitCouponDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onProceed: () => void;
}

export const CircleBenefitCouponDialog: React.FC<CircleBenefitCouponDialogProps> = (props) => {
  return (
    <Overlay
      isVisible={props.visible}
      windowBackgroundColor={'rgba(0, 0, 0, 0.8)'}
      containerStyle={{
        marginBottom: 20,
      }}
      fullScreen
      transparent
      overlayStyle={styles.overlayStyle}
      onRequestClose={() => props.onDismiss()}
      onDismiss={() => props.onDismiss()}
      onBackdropPress={() => props.onDismiss()}
    >
      <View>
        <View style={styles.mainView}>
          <View style={styles.headerContainer}>
            <Text style={styles.textHeader}>Free Consult </Text>
            <TouchableOpacity
              onPress={() => props.onDismiss()}
              style={{
                height: 12,
                width: 12,
                marginRight: 17,
                justifyContent: 'center',
              }}
            >
              <CrossPopup />
            </TouchableOpacity>
          </View>
          <View style={styles.separator}></View>
          <Text style={styles.textDescription}>
            Use coupon ‘CIRCLEBENEFITS’ to avail your free consultations. You can also find it in
            your coupon tray.
          </Text>

          <View style={styles.couponCodeContainer}>
            <Text style={styles.textCouponCode}>CIRCLEBENEFITS</Text>
            <View style={styles.copyContainer}>
              <CopyIcon style={styles.copyLogo} />
              <Text style={styles.textCopy}> COPY </Text>
            </View>
          </View>
          <Button
            title={'PROCEED'}
            style={styles.proceedButton}
            onPress={() => props.onProceed()}
          />
          <Text style={styles.textDiscalaimer}>
            This coupon is applicable to select doctors only.
          </Text>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  mainView: {
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  overlayStyle: {
    padding: 0,
    margin: 0,
    width: '88.88%',
    height: '88.88%',
    borderRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    elevation: 0,
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 3,
    backgroundColor: colors.SHADOW_GRAY,
    opacity: 0.2,
    marginHorizontal: -16,
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 5,
    zIndex: 1,
  },
  textDiscalaimer: {
    alignSelf: 'center',
    marginTop: 16,
    textAlign: 'center',
    ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR),
  },
  couponCodeContainer: {
    flexDirection: 'row',
    marginTop: 21,
    marginBottom: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textCouponCode: {
    ...theme.viewStyles.text('B', 16, theme.colors.SHERPA_BLUE),
  },
  copyContainer: {
    flexDirection: 'row',
    borderColor: theme.colors.APP_YELLOW,
    borderRadius: 4,
    borderWidth: 1,
    padding: 5,
    marginLeft: 10,
  },
  copyLogo: {
    marginHorizontal: 4,
    width: 9,
    height: 10,
    opacity: 0.7,
    alignSelf: 'center',
    tintColor: theme.colors.APP_YELLOW,
  },
  textCopy: {
    ...theme.viewStyles.text('R', 13, theme.colors.APP_YELLOW),
  },
  textDescription: {
    alignSelf: 'center',
    marginTop: 16,
    textAlign: 'center',
    ...theme.viewStyles.text('R', 13, theme.colors.SHERPA_BLUE),
  },
  headerContainer: {
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: -30,
    flexDirection: 'row',
  },
  textHeader: {
    textAlign: 'center',
    flex: 1,
    marginLeft: 25,
    ...theme.viewStyles.text('M', 15, theme.colors.SHERPA_BLUE),
  },
  proceedButton: {
    bottom: 0,
    right: 0,
    marginBottom: 0,
    width: '50%',
    alignSelf: 'center',
  },
});
