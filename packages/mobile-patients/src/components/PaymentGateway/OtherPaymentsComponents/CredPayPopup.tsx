import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import {
  OffersIcon,
  CircleCheckIcon,
  CircleUncheckIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';

export interface CredPayProps {
  onPressPayNow: (wallet: string) => void;
  paymentMethod: any;
  credInfo: any;
}

export const CredPayPopup: React.FC<CredPayProps> = (props) => {
  const { onPressPayNow, paymentMethod, credInfo } = props;
  const renderImage = () => {
    const imageUrl = credInfo?.layout?.icon;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: imageUrl }} style={{ height: 25, width: 25 }} />
        <Text style={styles.name}>{credInfo?.layout?.ctaText}</Text>
      </View>
    );
  };

  const renderPayNowButton = () => {
    return (
      <Button
        style={{ marginTop: 12, borderRadius: 5 }}
        title={'PAY NOW'}
        onPress={() => onPressPayNow(paymentMethod?.payment_method_code)}
      />
    );
  };

  const renderOffer = () => {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <OffersIcon style={styles.offerIcon} />
        <Text style={styles.offermsg}>{credInfo?.layout?.subText}</Text>
      </View>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        <View
          style={{ ...styles.wallet, opacity: paymentMethod?.outage_status == 'DOWN' ? 0.5 : 1 }}
          // onPress={() => onPressPayNow(paymentMethod?.payment_method_code)}
        >
          {renderImage()}
          {!paymentMethod?.outage_list?.[0]?.outage_status ? (
            <CircleCheckIcon style={styles.icon} />
          ) : (
            <CircleUncheckIcon style={styles.icon} />
          )}
        </View>
        {renderOffer()}
        {renderPayNowButton()}
      </View>
    );
  };

  return <View>{renderChildComponent()}</View>;
};

const styles = StyleSheet.create({
  ChildComponent: {
    paddingTop: 15,
    paddingBottom: 12,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 24,
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
    marginLeft: 4,
  },
  name: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    textAlign: 'center',
    marginLeft: 8,
  },
  offermsg: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    marginLeft: 5,
    color: '#00B38E',
  },
  offerIcon: {
    height: 20,
    width: 20,
  },
  wallet: {
    flexDirection: 'row',
    paddingBottom: 10,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
  icon: {
    height: 18,
    width: 18,
  },
});
