import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { WalletIcon } from '@aph/mobile-patients/src/components/PaymentGateway/Components/WalletIcon';
import {
  paymentModeVersionCheck,
  getBestOffer,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
import { OffersIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { ActivityIndicator } from 'react-native-paper';

export interface WalletsProps {
  onPressPayNow: (wallet: string, bestOffer?: any) => void;
  onPressLinkWallet: (wallet: string, bestOffer?: any) => void;
  onPressDirectDebit: (wallet: string, token: string, bestOffer?: any) => void;
  wallets: any;
  offers: any;
  linked: any;
  amount: number;
  createdWallet: any;
  walletLinking: any;
}
const windowWidth = Dimensions.get('window').width;

export const Wallets: React.FC<WalletsProps> = (props) => {
  const {
    onPressPayNow,
    wallets,
    offers,
    linked,
    amount,
    onPressLinkWallet,
    onPressDirectDebit,
    createdWallet,
    walletLinking,
  } = props;
  const phonePe = 'https://newassets.apollo247.com/images/upiicons/phone-pe.png';

  const renderTitle = (item: any, linkedWallet: any) => {
    return (
      <View style={{ marginRight: 5, paddingRight: 15 }}>
        <Text style={styles.walletName}>{item?.item?.payment_method_name}</Text>
        {linkedWallet?.linked ? (
          Number(linkedWallet?.currentBalance) < amount ? (
            <Text style={{ ...styles.walletBalance, color: '#BF2600' }}>
              Low Balance: ₹{linkedWallet?.currentBalance}
            </Text>
          ) : (
            <Text style={styles.walletBalance}>Balance: ₹{linkedWallet?.currentBalance}</Text>
          )
        ) : null}
      </View>
    );
  };

  const renderOffer = (item: any, bestOffer: any) => {
    return !!bestOffer ? (
      <View style={styles.offer}>
        <OffersIcon style={styles.offerIcon} />
        <Text numberOfLines={2} style={styles.offerTitle}>
          {getOfferDescription(bestOffer, item)}
        </Text>
      </View>
    ) : null;
  };

  const getOfferDescription = (bestOffer: any, item: any) => {
    const orderBreakup = bestOffer?.order_breakup;
    return parseFloat(orderBreakup?.discount_amount) > 50
      ? `Get ₹${orderBreakup?.discount_amount} off on ${item?.item?.payment_method_name} wallet`
      : parseFloat(orderBreakup?.cashback_amount) > 50
      ? `Get ₹${orderBreakup?.cashback_amount} cashback on ${item?.item?.payment_method_name} wallet`
      : bestOffer?.offer_description?.description;
  };

  const renderButton = (paymentCode: any, linkedWallet: any) => {
    return paymentCode == 'AMAZONPAY'
      ? linkedWallet?.linked
        ? Number(linkedWallet?.currentBalance) < amount
          ? 'ADD MONEY & PAY'
          : 'PAY NOW'
        : 'LINK ACCOUNT'
      : 'PAY NOW';
  };

  const onPress = (paymentCode: any, linkedWallet: any, bestOffer: any) => {
    return paymentCode == 'AMAZONPAY'
      ? linkedWallet?.linked
        ? onPressDirectDebit(paymentCode, linkedWallet?.token, bestOffer)
        : onPressLinkWallet(paymentCode, bestOffer)
      : onPressPayNow(paymentCode, bestOffer);
  };

  const renderLoader = () => {
    return <ActivityIndicator size="small" color="#00b38e" style={{ marginRight: 16 }} />;
  };

  const renderWallet = (item: any) => {
    const paymentCode = item?.item?.payment_method_code;
    const bestOffer = getBestOffer(offers, paymentCode);
    const walletCreated =
      createdWallet?.linked && createdWallet?.wallet == paymentCode ? createdWallet : null;
    const linkedWallet =
      walletCreated || linked?.filter((wallet: any) => wallet?.wallet == paymentCode)?.[0];
    return (
      <View>
        <OutagePrompt
          outageStatus={item?.item?.outage_status}
          msg={item?.item?.payment_method_name + ' is'}
        />
        <TouchableOpacity
          disabled={
            item?.item?.outage_status == 'DOWN' || walletLinking == paymentCode ? true : false
          }
          style={{
            ...styles.wallet,
            borderBottomWidth: item?.index == wallets.length - 1 ? 0 : 1,
            opacity: item?.item?.outage_status == 'DOWN' ? 0.5 : 1,
          }}
          onPress={() => onPress(paymentCode, linkedWallet, bestOffer)}
        >
          <WalletIcon
            imageUrl={
              item?.item?.payment_method_name == 'PhonePe' ? phonePe : item?.item?.image_url
            }
          />
          <View style={{ width: windowWidth - 75 }}>
            <View style={styles.walletCont}>
              {renderTitle(item, linkedWallet)}
              {walletLinking != paymentCode ? (
                <Text style={styles.payNow}>{renderButton(paymentCode, linkedWallet)}</Text>
              ) : (
                renderLoader()
              )}
            </View>
            {renderOffer(item, bestOffer)}
          </View>
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
    paddingVertical: 16,
    borderColor: 'rgba(0,0,0,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
  walletCont: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  walletName: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 12,
  },
  walletBalance: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: '#01475B',
    marginTop: 2,
    marginLeft: 12,
  },
  offer: {
    marginRight: 20,
    flexDirection: 'row',
    marginLeft: 12,
    marginTop: 2,
  },
  offerTitle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: '#34AA55',
    marginLeft: 4,
    flexWrap: 'wrap',
  },
  offerIcon: {
    marginTop: 2,
    height: 16,
    width: 16,
  },
});
