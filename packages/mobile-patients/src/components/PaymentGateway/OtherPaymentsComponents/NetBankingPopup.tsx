import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  ScrollView,
  SafeAreaView,
  TouchableHighlightBase,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { PayCash } from '@aph/mobile-patients/src/components/ui/Icons';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { BlackArrowUp, CheckIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export interface NetBankingProps {
  onPressBank: (wallet: string) => void;
  allPaymentModes: any;
}
const bankWidth = (windowWidth - 44) * 0.5;

export const NetBankingPopup: React.FC<NetBankingProps> = (props) => {
  const { allPaymentModes, onPressBank } = props;
  const topBanks = allPaymentModes
    ?.filter((item: any) => item?.name == 'FEATURED_BANKS')?.[0]
    ?.payment_methods?.slice(0, 4);
  let otherBanks = allPaymentModes?.find((item: any) => item?.name == 'OTHER_BANKS');
  const methods = topBanks?.map((item: any) => item?.payment_method_code);
  otherBanks = otherBanks?.payment_methods?.filter(
    (item: any) => !methods?.includes(item?.payment_method_code)
  );
  const getOutageMsg = () => {
    const banks = topBanks?.slice(0, 3);
    const outagebanks = banks?.filter(
      (item: any) =>
        item?.outage_list?.[0]?.outage_status == 'FLUCTUATE' ||
        item?.outage_list?.[0]?.outage_status == 'DOWN'
    );
    let msg = '';
    if (outagebanks?.length == 1) {
      msg = `${outagebanks?.[0]?.payment_method_name} is`;
    } else if (outagebanks?.length > 1) {
      outagebanks?.forEach((item: any, index: number) => {
        if (index == 0) {
          msg = item?.payment_method_name;
        } else if (index == outagebanks?.length - 1) {
          msg = msg + ', and ' + item?.payment_method_name;
        } else {
          msg = msg + ', ' + item?.payment_method_name;
        }
        if (index == outagebanks?.length - 1) {
          msg = msg + ' are';
        }
      });
    }
    return msg;
  };

  const banksOutageCheck = () => {
    const banks = topBanks?.slice(0, 4);
    const bank = banks.find(
      (item: any) => item?.outage_status == 'FLUCTUATE' || item?.outage_status == 'DOWN'
    );
    return bank;
  };

  const renderTopBank = (item: any) => {
    const outageStatus = item?.outage_list?.[0]?.outage_status;
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        style={{ ...styles.topBankCont, opacity: outageStatus == 'DOWN' ? 0.5 : 1 }}
        disabled={outageStatus == 'DOWN' ? true : false}
        onPress={() => onPressBank(item?.payment_method_code)}
      >
        <View style={{ height: 17, width: 75 }}>
          {outageStatus == 'DOWN' && <Text style={styles.lowSuccess}>Low Success</Text>}
        </View>
        <View style={styles.topBank}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: item?.image_url }} style={styles.bankIcon} />
            <Text style={styles.bankName}>{item?.payment_method_name}</Text>
          </View>
          <BlackArrowUp style={styles.arrow} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTopBanks = () => {
    const msg = getOutageMsg();
    const bank = banksOutageCheck();
    return (
      <View>
        <View style={{ marginLeft: 16 }}>
          <OutagePrompt outageStatus={bank?.outage_list?.[0]?.outage_status} msg={msg} />
        </View>
        <View style={styles.ChildComponent}>
          {topBanks?.map((item: any) => {
            return renderTopBank(item);
          })}
        </View>
      </View>
    );
  };

  const renderOtherBank = (item: any, index: number) => {
    const outageStatus = item?.outage_list?.[0]?.outage_status;
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => onPressBank(item?.payment_method_code)}
        style={{
          ...styles.otherBankCont,
          borderTopWidth: index == 0 ? 0 : 1,
          opacity: outageStatus == 'DOWN' ? 0.5 : 1,
        }}
        disabled={outageStatus == 'DOWN' ? true : false}
      >
        <View style={styles.otherBank}>
          <Text style={{ ...styles.bankName, marginLeft: 0 }}>{item?.payment_method_name}</Text>
          <BlackArrowUp style={styles.arrow} />
        </View>
        <OutagePrompt outageStatus={outageStatus} />
      </TouchableOpacity>
    );
  };

  const renderOtherBanks = () => {
    return (
      <View style={styles.otherBanks}>
        {otherBanks?.map((item: any, index: number) => renderOtherBank(item, index))}
      </View>
    );
  };
  const renderOtherBanksCont = () => {
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>ALL BANKS</Text>
        {renderOtherBanks()}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <ScrollView nestedScrollEnabled={true}>
        {renderTopBanks()}
        {renderOtherBanksCont()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 0.5 * windowHeight,
  },
  ChildComponent: {
    marginHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
  },
  topBankCont: {
    width: bankWidth,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    marginBottom: 12,
    marginHorizontal: 6,
    backgroundColor: '#FAFEFF',
  },
  topBank: {
    flexDirection: 'row',
    paddingBottom: 17,
    paddingHorizontal: 17,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lowSuccess: {
    backgroundColor: '#FFF8ED',
    ...theme.fonts.IBMPlexSansMedium(10),
    color: '#CF8F6A',
    lineHeight: 14,
    paddingHorizontal: 8,
  },
  bankName: {
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    marginLeft: 13,
    color: '#01475B',
  },
  otherBanks: {
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderTopEndRadius: 4,
    borderTopLeftRadius: 4,
    backgroundColor: '#FAFEFF',
    marginTop: 12,
  },
  otherBankCont: {
    paddingVertical: 12,
    borderColor: '#E5E5E5',
    marginHorizontal: 12,
  },
  otherBank: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrow: {
    width: 15,
    height: 7,
    transform: [{ rotate: '90deg' }],
  },
  header: {
    marginHorizontal: 16,
    paddingBottom: 12,
  },
  heading: {
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 18,
    color: '#01475B',
    marginLeft: 4,
    marginTop: 12,
  },
  bankIcon: {
    height: 25,
    width: 25,
  },
});
