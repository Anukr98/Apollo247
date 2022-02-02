import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { WalletIcon } from '@aph/mobile-patients/src/components/PaymentGateway/Components/WalletIcon';
import {
  paymentModeVersionCheck,
  getBestOffer,
  getOfferDescription,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
import {
  OffersIcon,
  CircleCheckIcon,
  CircleUncheckIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { ActivityIndicator } from 'react-native-paper';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface WalletsProps {
  onPressPayNow: (wallet: string, bestOffer?: any) => void;
  onPressLinkWallet: (wallet: string, bestOffer?: any) => void;
  onPressDirectDebit: (wallet: string, token: string, bestOffer?: any) => void;
  wallets: any;
  offers: any;
  linked: any;
  amount: number;
  createdWallet: any;
  popUp?: boolean;
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
    popUp,
    walletLinking,
  } = props;
  const phonePe = 'https://newassets.apollo247.com/images/upiicons/phone-pe.png';
  const Apay = 'https://prodaphstorage.blob.core.windows.net/paymentlogos/amazon_pay.png';
  const [Apayselected, setApayselected] = useState<boolean>(false);

  const renderTitle = (item: any, linkedWallet: any) => {
    return <Text style={styles.walletName}>{item?.item?.payment_method_name}</Text>;
  };

  const renderOffer = (item: any, bestOffer: any) => {
    return !!bestOffer ? (
      <View style={styles.offer}>
        <OffersIcon style={styles.offerIcon} />
        <Text numberOfLines={2} style={styles.offerTitle}>
          {getOfferDescription(bestOffer, item?.item)}
        </Text>
      </View>
    ) : null;
  };

  const renderButton = (paymentCode: any, linkedWallet: any) => {
    return paymentCode == 'AMAZONPAY'
      ? linkedWallet?.linked
        ? Number(linkedWallet?.current_balance) < amount
          ? 'ADD MONEY & PAY'
          : 'PAY NOW'
        : 'LINK ACCOUNT'
      : 'PAY NOW';
  };

  const onPress = (paymentCode: any, linkedWallet: any, bestOffer: any) => {
    return paymentCode == 'AMAZONPAY'
      ? linkedWallet?.linked
        ? setApayselected(!Apayselected)
        : onPressLinkWallet(paymentCode, bestOffer)
      : onPressPayNow(paymentCode, bestOffer);
  };

  const renderLoader = () => {
    return <ActivityIndicator size="small" color="#FC9916" style={{ marginRight: 16 }} />;
  };

  const renderWallet = (item: any) => {
    const paymentCode = item?.item?.payment_method_code;
    const outageStatus = item?.item?.outage_list?.[0]?.outage_status;
    const bestOffer = !outageStatus ? item?.item?.offers?.[0] : null;
    const walletCreated =
      createdWallet?.linked && createdWallet?.wallet == paymentCode ? createdWallet : null;
    const linkedWallet =
      walletCreated || linked?.filter((wallet: any) => wallet?.wallet == paymentCode)?.[0];
    return (
      <View>
        <TouchableOpacity
          style={{
            ...styles.subCont,
            borderBottomWidth: item?.index == wallets.length - 1 ? 0 : 1,
          }}
          disabled={outageStatus == 'DOWN' ? true : false}
          onPress={() => onPress(paymentCode, linkedWallet, bestOffer)}
        >
          <View style={{ ...styles.wallet, opacity: outageStatus == 'DOWN' ? 0.5 : 1 }}>
            <WalletIcon
              imageUrl={
                item?.item?.payment_method_name == 'PhonePe'
                  ? phonePe
                  : item?.item?.payment_method_name == 'Amazon Pay'
                  ? Apay
                  : item?.item?.image_url
              }
            />
            <View style={styles.walletCont}>
              {renderTitle(item, linkedWallet)}
              {paymentCode == 'AMAZONPAY' && linkedWallet?.linked ? (
                renderBalance(linkedWallet)
              ) : walletLinking != paymentCode ? (
                <Text style={styles.payNow}>{renderButton(paymentCode, linkedWallet)}</Text>
              ) : (
                renderLoader()
              )}
            </View>
          </View>
          <OutagePrompt outageStatus={outageStatus} />
          {renderOffer(item, bestOffer)}
          {Apayselected && renderPayNowButton(linkedWallet, paymentCode, bestOffer)}
        </TouchableOpacity>
      </View>
    );
  };

  const renderBalance = (linkedWallet: any) => {
    return (
      <View style={{ flexDirection: 'row' }}>
        {Number(linkedWallet?.current_balance) < amount ? (
          <Text style={styles.balance}> Low Balance: ₹{linkedWallet?.current_balance}</Text>
        ) : (
          <Text style={styles.balance}>₹{linkedWallet?.current_balance}</Text>
        )}
        {Apayselected ? (
          <CircleCheckIcon style={styles.icon} />
        ) : (
          <CircleUncheckIcon style={styles.icon} />
        )}
      </View>
    );
  };

  const renderPayNowButton = (linkedWallet: any, paymentCode: string, bestOffer: any) => {
    const title =
      Number(linkedWallet?.current_balance) < amount ? 'ADD MONEY AND PAY' : `PAY ₹${amount}`;

    return !!linkedWallet ? (
      <Button
        style={{ marginTop: 10, borderRadius: 5 }}
        title={title}
        onPress={() => {
          onPressDirectDebit(paymentCode, linkedWallet?.token, bestOffer);
        }}
      />
    ) : null;
  };

  const renderWallets = () => {
    return (
      <View
        style={{
          ...styles.ChildComponent,
          marginTop: popUp ? 12 : 0,
          marginBottom: popUp ? 24 : 0,
        }}
      >
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

  const renderHeader = () => {
    return !popUp ? (
      <View style={styles.header}>
        <Text style={styles.heading}>WALLETS</Text>
      </View>
    ) : null;
  };

  return !!wallets?.length ? (
    <View>
      {renderHeader()}
      {renderWallets()}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  ChildComponent: {
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  subCont: {
    borderColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
    paddingBottom: 16,
  },
  wallet: {
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
    flex: 1,
  },
  walletName: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 12,
    letterSpacing: 0.01,
  },
  walletBalance: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 16,
    color: '#01475B',
    marginTop: 2,
    marginLeft: 12,
  },
  offer: {
    flexDirection: 'row',
    marginTop: 3,
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
  balance: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 18,
    color: '#01475B',
  },
  icon: {
    height: 18,
    width: 18,
    marginLeft: 8,
  },
});
