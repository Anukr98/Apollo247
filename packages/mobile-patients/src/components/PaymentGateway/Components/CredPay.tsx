import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { paymentModeVersionCheck } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
import { OffersIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { AppConfig } from '@aph/mobile-patients/src/strings/AppConfig';

export interface CredPayProps {
  onPressPayNow: (wallet: string) => void;
  paymentMethod: any;
  credInfo: any;
}

export const CredPay: React.FC<CredPayProps> = (props) => {
  const { onPressPayNow, paymentMethod, credInfo } = props;
  const enableCredWebView = AppConfig.Configuration.enableCredWebView;
  const isWebView = credInfo?.flowType == 'web';

  const renderImage = () => {
    const imageUrl = credInfo?.layout?.icon;
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={{ uri: imageUrl }} style={{ height: 25, width: 25 }} />
        <Text style={styles.name}>{credInfo?.layout?.ctaText}</Text>
      </View>
    );
  };

  const renderOffer = () => {
    return (
      <View style={styles.offerCont}>
        <OffersIcon style={styles.offerIcon} />
        <Text style={styles.offermsg}>{credInfo?.layout?.subText}</Text>
      </View>
    );
  };

  const renderCred = () => {
    return (
      <View style={styles.ChildComponent}>
        <OutagePrompt
          outageStatus={paymentMethod?.outage_status}
          msg={paymentMethod?.payment_method_name + ' is'}
        />
        <TouchableOpacity
          disabled={paymentMethod?.outage_status == 'DOWN' ? true : false}
          style={{ ...styles.wallet, opacity: paymentMethod?.outage_status == 'DOWN' ? 0.5 : 1 }}
          onPress={() => onPressPayNow(paymentMethod?.payment_method_code)}
        >
          {renderImage()}
          <Text style={styles.payNow}>PAY NOW</Text>
        </TouchableOpacity>
        {renderOffer()}
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>CRED</Text>
      </View>
    );
  };

  const renderCredCont = () => {
    return (
      <View>
        {renderHeader()}
        {renderCred()}
      </View>
    );
  };

  return isWebView ? (enableCredWebView ? renderCredCont() : null) : renderCredCont();
};

const styles = StyleSheet.create({
  ChildComponent: {
    flex: 1,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    // paddingBottom: 10,
    paddingHorizontal: 12,
  },
  wallet: {
    flexDirection: 'row',
    paddingBottom: 10,
    marginTop: 12,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
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
  offerCont: {
    flexDirection: 'row',
    paddingBottom: 12,
    alignItems: 'center',
  },
  offerIcon: {
    height: 20,
    width: 20,
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 8,
    marginTop: 16,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
  },
});
