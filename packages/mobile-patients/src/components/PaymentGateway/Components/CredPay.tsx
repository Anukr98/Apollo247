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
      <View style={{ flexDirection: 'row', paddingBottom: 15, alignItems: 'center' }}>
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

  return isWebView ? (
    enableCredWebView ? (
      <CollapseView isDown={true} Heading={'CRED pay'} ChildComponent={renderCred()} />
    ) : null
  ) : (
    <CollapseView isDown={true} Heading={'CRED pay'} ChildComponent={renderCred()} />
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  wallet: {
    flexDirection: 'row',
    paddingBottom: 14,
    marginTop: 15,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FC9916',
  },
  name: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
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
});
