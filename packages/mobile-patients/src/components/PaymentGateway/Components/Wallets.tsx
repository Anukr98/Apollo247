import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { WalletIcon } from '@aph/mobile-patients/src/components/PaymentGateway/Components/WalletIcon';
import { paymentModeVersionCheck } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';

export interface WalletsProps {
  onPressPayNow: (wallet: string) => void;
  wallets: any;
}

export const Wallets: React.FC<WalletsProps> = (props) => {
  const { onPressPayNow, wallets } = props;

  const renderWallet = (item: any) => {
    return (
      <View>
        <OutagePrompt
          outageStatus={item?.item?.outage_status}
          msg={item?.item?.payment_method_name + ' is'}
        />
        <TouchableOpacity
          disabled={item?.item?.outage_status == 'DOWN' ? true : false}
          style={{
            ...styles.wallet,
            borderBottomWidth: item?.index == wallets.length - 1 ? 0 : 1,
            opacity: item?.item?.outage_status == 'DOWN' ? 0.5 : 1,
          }}
          onPress={() => onPressPayNow(item?.item?.payment_method_code)}
        >
          <WalletIcon imageUrl={item?.item?.image_url} />
          <Text style={styles.payNow}>PAY NOW</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const renderWallets = () => {
    return (
      <View style={styles.ChildComponent}>
        <FlatList
          data={wallets}
          renderItem={(item: any) => {
            return paymentModeVersionCheck(item?.item?.minimum_supported_version)
              ? renderWallet(item)
              : null;
          }}
        />
      </View>
    );
  };

  return !!wallets?.length ? (
    <CollapseView isDown={true} Heading={'WALLETS'} ChildComponent={renderWallets()} />
  ) : null;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  wallet: {
    flexDirection: 'row',
    paddingBottom: 18,
    marginTop: 15,
    borderColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'space-between',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(14),
    lineHeight: 24,
    color: '#FC9916',
  },
});
