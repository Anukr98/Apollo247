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
const { width } = Dimensions.get('window');
const newWidth = width - 40;
export interface NetBankingProps {
  onPressOtherBanks: () => void;
  onPressBank: (bankCode: string) => void;
  topBanks: any;
}

export const NetBanking: React.FC<NetBankingProps> = (props) => {
  const { onPressOtherBanks, topBanks, onPressBank } = props;

  const renderBank = (item: any) => {
    const marginLeft = item?.index == 0 ? 0 : (newWidth - 180) * 0.33;
    return (
      <View style={{ ...styles.bankCont, marginLeft: marginLeft }}>
        <TouchableOpacity onPress={() => onPressBank(item?.item?.payment_method_code)}>
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
      <View>
        <FlatList
          style={{ flex: 1 }}
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
        {renderTopBanks()}
        {renderShowOtherBanks()}
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
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    width: 45,
    alignItems: 'center',
    marginBottom: 20,
  },
});
