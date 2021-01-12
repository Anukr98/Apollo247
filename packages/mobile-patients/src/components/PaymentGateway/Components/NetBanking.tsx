import React, { useEffect, useState } from 'react';
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
    return (
      <View style={styles.bankCont}>
        <TouchableOpacity onPress={() => onPressBank(item?.item?.method)}>
          <Image
            source={{ uri: item?.item?.image_url }}
            resizeMode={'contain'}
            style={styles.bankIcon}
          />
        </TouchableOpacity>
        <Text numberOfLines={2} style={styles.bankName}>
          {item?.item?.bank}
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
          renderItem={(item) => renderBank(item)}
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

  return <CollapseView Heading={'NET BANKING'} ChildComponent={renderChildComponent()} />;
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
    width: newWidth / 4,
    alignItems: 'center',
    marginBottom: 15,
  },
});
