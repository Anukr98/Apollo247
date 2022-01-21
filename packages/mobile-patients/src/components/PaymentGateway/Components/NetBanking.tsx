import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { CollapseView } from '@aph/mobile-patients/src/components/PaymentGateway/Components/CollapseView';
import { paymentModeVersionCheck } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { OutagePrompt } from '@aph/mobile-patients/src/components/PaymentGateway/Components/OutagePrompt';
import { ArrowOrange } from '@aph/mobile-patients/src/components/ui/Icons';

const { width } = Dimensions.get('window');
const newWidth = width - 56;
export interface NetBankingProps {
  onPressOtherBanks: () => void;
  onPressBank: (bankCode: string) => void;
  topBanks: any;
}

export const NetBanking: React.FC<NetBankingProps> = (props) => {
  const { onPressOtherBanks, topBanks, onPressBank } = props;

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
      (item: any) =>
        item?.outage_list?.[0]?.outage_status == 'FLUCTUATE' ||
        item?.outage_list?.[0]?.outage_status == 'DOWN'
    );
    return bank;
  };

  const renderBank = (item: any) => {
    const marginLeft = item?.index == 0 ? 0 : (newWidth - 240) * 0.328;
    const outageStatus = item?.item?.outage_list?.[0]?.outage_status;
    return (
      <View
        style={{
          ...styles.bankCont,
          marginLeft: marginLeft,
          opacity: outageStatus == 'DOWN' ? 0.5 : 1,
        }}
      >
        <TouchableOpacity
          disabled={outageStatus == 'DOWN' ? true : false}
          onPress={() => onPressBank(item?.item?.payment_method_code)}
        >
          <Image
            source={{ uri: item?.item?.image_url }}
            resizeMode={'contain'}
            style={styles.bankIcon}
          />
        </TouchableOpacity>
        <Text numberOfLines={2} style={styles.bankName}>
          {item?.item?.payment_method_name}
        </Text>
      </View>
    );
  };

  const renderTopBanks = () => {
    return (
      <View style={{ paddingHorizontal: 12 }}>
        <FlatList
          style={styles.banks}
          data={topBanks.slice(0, 4)}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={(item: any) => {
            return paymentModeVersionCheck(item?.item?.minimum_supported_version)
              ? renderBank(item)
              : null;
          }}
        />
      </View>
    );
  };

  const renderShowOtherBanks = () => {
    return (
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={onPressOtherBanks}
      >
        <Text style={styles.otherBanks}> MORE BANKS</Text>
        <ArrowOrange />
      </TouchableOpacity>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {renderTopBanks()}
        {renderShowOtherBanks()}
      </View>
    );
  };

  const renderHeader = () => {
    const msg = getOutageMsg();
    const bank = banksOutageCheck();
    return (
      <View style={styles.header}>
        <Text style={styles.heading}>NET BANKING</Text>
        {!!msg && <OutagePrompt outageStatus={bank?.outage_list?.[0]?.outage_status} msg={msg} />}
      </View>
    );
  };

  return (
    <View>
      {renderHeader()}
      {renderChildComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    flex: 1,
    backgroundColor: '#FAFEFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 4,
    paddingBottom: 10,
  },
  banks: {
    flex: 1,
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 10,
  },
  otherBanks: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FCB716',
    paddingLeft: 12,
  },
  bankName: {
    marginTop: 10,
    ...theme.fonts.IBMPlexSansMedium(14),
    lineHeight: 20,
    color: '#01475B',
    textAlign: 'center',
  },
  bankIcon: {
    height: 35,
    width: 35,
  },
  bankCont: {
    width: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  outageStatus: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 14,
    color: '#01475B',
    backgroundColor: '#FCFDDA',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 5,
    marginTop: 2,
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
