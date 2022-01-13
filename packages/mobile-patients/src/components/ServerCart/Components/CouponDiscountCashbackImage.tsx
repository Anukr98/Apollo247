import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Confetti, DiscountCashback } from '../../ui/Icons';
import { theme } from '@aph/mobile-patients/src/theme/theme';

export const CouponDiscountCashbackImage = () => {
  const renderDiscountCashback = () => {
    return (
      <View style={styles.container}>
        <View style={styles.couponContainer}>
          {/* <ImageBackground
            source={require('@aph/mobile-patients/src/components/ui/icons/Discount+Cashback.png')}
            style={{ width: '100%', height: '80%' }}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Text style={styles.hcText}>HCs will be credited after order delivery. 1HC = ₹1</Text>
            </View>
          </ImageBackground> */}
          {/* <Confetti style={styles.confetti} /> */}
          <DiscountCashback style={styles.couponImage} />
          <View
            style={[
              styles.textUnderline,
              {
                position: 'absolute',
                top: 160,
                //   bottom: 206,
                left: 110,
                justifyContent: 'center',
                // backgroundColor: '#00ff33',
              },
            ]}
          >
            <Text style={styles.couponText}>DOUBLE</Text>
            <Text style={styles.couponText}>Applied!</Text>
          </View>
          <View
            style={{
              position: 'absolute',
              top: 240,
              //   bottom: 206,
              left: 110,
              justifyContent: 'center',
              //   backgroundColor: '#00ff33',
            }}
          >
            <Text style={styles.discountAmount}>₹25</Text>
            <Text style={styles.discountAmount}>OFF</Text>
          </View>
          <View
            style={{
              position: 'absolute',
              // top: 50, left: 70 ,
              bottom: 280,
              left: 115,
              //   width: 180,
              justifyContent: 'center',
              //   backgroundColor: '#00ff33',
            }}
          >
            <Text style={styles.hcAmount}>25 HC</Text>
            <Text style={styles.cashbackText}>cashback earned</Text>
          </View>
          <View
            style={{
              position: 'absolute',
              // top: 50, left: 70 ,
              bottom: 206,
              left: 85,
              width: 180,
              justifyContent: 'center',
              //   backgroundColor: '#00ff33',
            }}
          >
            <Text style={styles.hcText}>HCs will be credited after order delivery. 1HC = ₹1</Text>
          </View>
        </View>
      </View>
    );
  };
  return renderDiscountCashback();
};

const styles = StyleSheet.create({
  container: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
  },
  couponContainer: {
    flex: 1,
    paddingTop: 50,
    justifyContent: 'flex-start',
    // margin: 5,
    // height: '100%',
    // width: '100%',
    // backgroundColor: '#ffffff',
  },
  confetti: {
    // height: 500,
    // width: 300,
  },
  couponImage: {
    // position: 'absolute',
    height: 500,
    width: 350,
  },
  couponText: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.SHADE_OF_CYAN,
    paddingBottom: 3,
  },
  textUnderline: {
    //   paddingTop: 5,
    borderBottomWidth: 2.5,
    borderColor: theme.colors.SHADE_OF_CYAN,
    // borderColor: theme.colors.HEX_WHITE,
    // borderBottomColor: theme.colors.SHADE_OF_CYAN,
  },
  discountAmount: {
    ...theme.fonts.IBMPlexSansBold(46),
    lineHeight: 56,
    fontWeight: '500',
    color: theme.colors.HEX_WHITE,
  },
  hcAmount: {
    ...theme.fonts.IBMPlexSansBold(24),
    lineHeight: 24,
    fontWeight: '600',
    color: theme.colors.HEX_WHITE,
  },
  cashbackText: {
    ...theme.fonts.IBMPlexSansBold(12),
    lineHeight: 16,
    fontWeight: '500',
    color: theme.colors.HEX_WHITE,
  },
  hcText: {
    ...theme.fonts.IBMPlexSansBold(11),
    lineHeight: 13,
    fontWeight: '600',
    color: theme.colors.TURQUOISE_LIGHT_BLUE,
  },
});
