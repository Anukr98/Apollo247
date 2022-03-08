import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { SavedCard } from '@aph/mobile-patients/src/components/PaymentGateway/Components/SavedCard';
import {
  getBestOffer,
  getOfferDescription,
  getIOSPackageName,
  paymentModeVersionCheck,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
import { WalletIcon } from '@aph/mobile-patients/src/components/PaymentGateway/Components/WalletIcon';
import {
  OffersIcon,
  CircleCheckIcon,
  CircleUncheckIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';

export interface PreferredPaymentsProps {
  preferredPayments: any;
  amount: any;
  cardTypes: any;
  onPressSavedCardPayNow: (cardInfo: any, cvv: string, bestOffer?: any) => void;
  allModes: any;
  onPressDirectDebit: (wallet: string, token: string, bestOffer?: any) => void;
  onPressWallet: (wallet: string, bestOffer?: any) => void;
  onPressUPIApp: (app: any) => void;
  availableUPIApps: any;
}

export const PreferredPayments: React.FC<PreferredPaymentsProps> = (props) => {
  const {
    preferredPayments,
    amount,
    cardTypes,
    onPressSavedCardPayNow,
    allModes,
    onPressDirectDebit,
    onPressWallet,
    onPressUPIApp,
    availableUPIApps,
  } = props;
  const wallets = allModes?.filter((item: any) => item?.name == 'WALLET')?.[0]?.payment_methods;
  const saved_cards = preferredPayments?.saved_cards;
  const linked_wallets = preferredPayments?.linked_wallets;
  const recently_used_or_defined = preferredPayments?.recently_used_or_defined;
  const usedWallets = recently_used_or_defined?.find((item: any) => item?.name == 'WALLET')
    ?.payment_methods;
  const usedUPIApps = recently_used_or_defined?.find((item: any) => item?.name == 'UPI')
    ?.payment_methods;
  const offers: any = [];
  const [selectedCardToken, setSelectedCardToken] = useState<string>('');
  const [Apayselected, setApayselected] = useState<boolean>(false);
  const Apay = 'https://prodaphstorage.blob.core.windows.net/paymentlogos/amazon_pay.png';

  const filterUPIApps = () => {
    if (availableUPIApps?.length) {
      const available = availableUPIApps?.map((item: any) => item?.packageName);
      const apps = usedUPIApps
        ?.map((app: any) => {
          if (
            available.includes(app?.payment_method_code) ||
            (available.includes(getIOSPackageName(app?.payment_method_code)) &&
              paymentModeVersionCheck(app?.minimum_supported_version))
          ) {
            return app;
          }
        })
        ?.filter((value: any) => value);
      return apps || [];
    } else {
      return [];
    }
  };

  const renderCard = (item: any) => {
    return (
      <SavedCard
        onPressSavedCardPayNow={onPressSavedCardPayNow}
        cardTypes={cardTypes}
        selectedCardToken={selectedCardToken}
        onPressSavedCard={(cardInfo) =>
          selectedCardToken == cardInfo?.card_token
            ? setSelectedCardToken('')
            : setSelectedCardToken(cardInfo?.card_token)
        }
        cardInfo={item}
        bestOffer={item?.offers?.[0]}
        amount={amount}
      />
    );
  };

  const renderSavedCards = () => {
    return saved_cards?.cards?.map((item: any) => renderCard(item));
  };

  const renderLinkedWallet = (linkedWallet: any) => {
    const wallet = wallets?.filter(
      (item: any) => item?.payment_method_code == linkedWallet?.wallet
    )?.[0];
    const paymentCode = wallet?.payment_method_code;
    const outageStatus = wallet?.outage_list?.[0]?.outage_status;
    const bestOffer = !outageStatus ? wallet?.offers?.[0] : null;
    return !!wallet ? (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.subCont}
          onPress={() => setApayselected(!Apayselected)}
        >
          <View style={styles.wallet}>
            <WalletIcon
              imageUrl={wallet?.payment_method_name == 'Amazon Pay' ? Apay : wallet?.image_url}
            />
            <View style={styles.walletCont}>
              <Text style={styles.walletName}>{wallet?.payment_method_name}</Text>
              {renderBalance(linkedWallet)}
            </View>
          </View>
          <OutagePrompt outageStatus={outageStatus} />
          {renderOffer(wallet, bestOffer)}
          {Apayselected && renderPayNowButton(linkedWallet, paymentCode, bestOffer)}
        </TouchableOpacity>
      </View>
    ) : null;
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

  const renderLinkedWallets = () => {
    return linked_wallets?.map((item: any) => renderLinkedWallet(item));
  };

  const renderUsedPayment = (item: any, mode: string) => {
    const outageStatus = item?.outage_list?.[0]?.outage_status;
    const bestOffer = !outageStatus ? item?.offers?.[0] : null;
    return (
      <View>
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.subCont}
          disabled={outageStatus == 'DOWN' ? true : false}
          onPress={() => {
            mode == 'wallet'
              ? onPressWallet(item?.payment_method_code, item?.offers?.[0])
              : onPressUPIApp(item);
          }}
        >
          <View style={{ ...styles.wallet, opacity: outageStatus == 'DOWN' ? 0.5 : 1 }}>
            <WalletIcon imageUrl={item?.image_url} />
            <View style={styles.walletCont}>
              <Text style={styles.walletName}>{item?.payment_method_name}</Text>
            </View>
            <Text style={styles.payNow}>PAY NOW</Text>
          </View>
          <OutagePrompt outageStatus={outageStatus} />
          {renderOffer(item, bestOffer)}
        </TouchableOpacity>
      </View>
    );
  };

  const renderUsedWallets = () => {
    return usedWallets?.map((item: any) => renderUsedPayment(item, 'wallet'));
  };

  const renderUsedUPIApps = () => {
    const apps = filterUPIApps();
    return apps?.map((item: any) => renderUsedPayment(item, 'upi'));
  };
  const renderPayments = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderSavedCards()}
        {renderLinkedWallets()}
        {renderUsedWallets()}
        {renderUsedUPIApps()}
      </View>
    );
  };
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>PREFERRED PAYMENT METHODS</Text>
      </View>
    );
  };

  const showPreferred = () => {
    return !!usedWallets ||
      !!filterUPIApps()?.length ||
      !!saved_cards?.cards?.length ||
      !!linked_wallets?.length
      ? true
      : false;
  };

  return showPreferred() ? (
    <View>
      {renderHeader()}
      {renderPayments()}
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
  subCont: {
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginHorizontal: 12,
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
  wallet: {
    flexDirection: 'row',
    alignItems: 'center',
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
  payNow: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FC9916',
  },
});
