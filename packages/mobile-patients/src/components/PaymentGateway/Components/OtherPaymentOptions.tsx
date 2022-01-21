import React from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  paymentModeVersionCheck,
  getBestOffer,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { BlackArrowUp, CheckIcon } from '@aph/mobile-patients/src/components/ui/Icons';
export interface OtherPaymentOptionsProps {
  paymentOptions: any;
  onPressOtherPaymentOption: (paymentInfo: any) => void;
  cred: any;
}

export const OtherPaymentOptions: React.FC<OtherPaymentOptionsProps> = (props) => {
  const { paymentOptions, onPressOtherPaymentOption, cred } = props;
  const otherPaymentMethodsInfo: any = {
    FEATURED_BANKS: {
      name: 'NetBanking',
      icon: require('@aph/mobile-patients/src/components/ui/icons/Banks.webp'),
    },
    UPI: {
      name: 'UPI Apps',
      icon: require('@aph/mobile-patients/src/components/ui/icons/UPI.webp'),
    },
    COD: {
      name: 'Pay on Delivery',
      icon: require('@aph/mobile-patients/src/components/ui/icons/PayCash.webp'),
    },
    CRED: {
      name: 'CRED pay',
      icon: require('@aph/mobile-patients/src/components/ui/icons/Cred.webp'),
    },
    OTHER_BANKS: {
      name: 'NetBanking',
      icon: require('@aph/mobile-patients/src/components/ui/icons/Banks.webp'),
    },
    WALLET: {
      name: 'Wallets',
      icon: require('@aph/mobile-patients/src/components/ui/icons/Wallets.webp'),
    },
    CARD: {
      name: 'Debit / Credit Cards',
      icon: require('@aph/mobile-patients/src/components/ui/icons/CardIcon.webp'),
    },
  };

  const renderOtherPaymentOption = (item: any) => {
    return item?.item?.name != 'OTHER_BANKS' ? (
      item?.item?.name == 'CRED' && !cred?.isEligible ? null : (
        <>
          {!!otherPaymentMethodsInfo?.[item?.item?.name] ? (
            <TouchableOpacity
              style={{ ...styles.paymentOption, borderTopWidth: item?.index == 0 ? 0 : 1 }}
              onPress={() => onPressOtherPaymentOption(item?.item)}
            >
              <Image
                source={otherPaymentMethodsInfo[item?.item?.name]['icon']}
                style={styles.icon}
              />
              <View style={styles.subCont}>
                <View>
                  <Text style={styles.name}>
                    {otherPaymentMethodsInfo[item?.item?.name]['name']}
                  </Text>
                  {!!item?.item?.banner_text && (
                    <Text style={styles.bannerTxt}>{item?.item?.banner_text}</Text>
                  )}
                </View>
                <BlackArrowUp style={{ width: 15, height: 7, transform: [{ rotate: '90deg' }] }} />
              </View>
            </TouchableOpacity>
          ) : null}
        </>
      )
    ) : null;
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        <FlatList
          data={paymentOptions}
          renderItem={(item: any) => {
            return paymentModeVersionCheck(item?.item?.minimum_supported_version)
              ? renderOtherPaymentOption(item)
              : null;
          }}
        />
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>OTHER PAYMENT METHODS</Text>
      </View>
    );
  };

  return !!paymentOptions?.length ? (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  ChildComponent: {
    // justifyContent: 'space-between',
    // alignItems: 'center',
    // paddingVertical: 15,
    paddingBottom: 2,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 12,
    marginTop: 24,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
  },
  paymentOption: {
    borderColor: '#E5E5E5',
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subCont: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    marginLeft: 14,
  },
  name: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
  },
  bannerTxt: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: '#01475B',
    marginTop: 2,
  },
  icon: {
    height: 30,
    width: 30,
  },
});
