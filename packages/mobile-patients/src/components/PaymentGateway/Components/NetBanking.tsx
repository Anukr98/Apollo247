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
const { width } = Dimensions.get('window');
const newWidth = width - 40;
export interface NetBankingProps {
  onPressOtherBanks: () => void;
  onPressBank: (bankCode: string) => void;
  topBanks: any;
}

export const NetBanking: React.FC<NetBankingProps> = (props) => {
  const { onPressOtherBanks, topBanks, onPressBank } = props;

  const banksOutageCheck = () => {
    const banks = topBanks?.slice(0, 4);
    const index = banks.findIndex(
      (item: any) => item?.outage_status == 'FLUCTUATE' || item?.outage_status == 'DOWN'
    );
    return index == -1 ? false : true;
  };

  const renderBank = (item: any) => {
    const marginLeft = item?.index == 0 ? 0 : (width - 320) * 0.33;
    return (
      <View style={{ ...styles.bankCont, marginLeft: marginLeft }}>
        <TouchableOpacity
          disabled={item?.item?.outage_status == 'DOWN' ? true : false}
          style={{ opacity: item?.item?.outage_status == 'DOWN' ? 0.5 : 1 }}
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
        {renderOutageStatus(item?.item?.outage_status)}
      </View>
    );
  };

  const renderOutageStatus = (outageStatus: string) => {
    return outageStatus == 'FLUCTUATE' || outageStatus == 'DOWN' ? (
      <View style={{}}>
        <Text
          style={{
            ...styles.outageStatus,
            backgroundColor: outageStatus == 'FLUCTUATE' ? '#FCFDDA' : '#FFEBE6',
            color: outageStatus == 'FLUCTUATE' ? '#01475B' : '#BF2600',
          }}
        >
          {outageStatus == 'FLUCTUATE' ? 'High failures' : 'Down'}
        </Text>
      </View>
    ) : null;
  };

  const renderTopBanks = () => {
    return (
      <View>
        <FlatList
          style={{ flex: 1, marginTop: 15 }}
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
      <TouchableOpacity onPress={onPressOtherBanks}>
        <Text style={styles.otherBanks}> Show Other Banks</Text>
      </TouchableOpacity>
    );
  };

  const renderChildComponent = () => {
    return (
      <View style={styles.ChildComponent}>
        {banksOutageCheck() && (
          <View style={{ paddingHorizontal: 20 }}>
            <OutagePrompt outageStatus={'FLUCTUATE'} msg={'Few Banks are'} />
          </View>
        )}
        <View>
          {renderTopBanks()}
          {renderShowOtherBanks()}
        </View>
      </View>
    );
  };

  return (
    <CollapseView isDown={true} Heading={'NET BANKING'} ChildComponent={renderChildComponent()} />
  );
};

const styles = StyleSheet.create({
  ChildComponent: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 15,
  },
  otherBanks: {
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#FCB716',
    textAlign: 'center',
  },
  bankName: {
    marginTop: 10,
    ...theme.fonts.IBMPlexSansBold(13),
    lineHeight: 17,
    color: '#01475B',
    textAlign: 'center',
  },
  bankIcon: {
    height: 35,
    width: 35,
  },
  bankCont: {
    width: 80,
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
});
