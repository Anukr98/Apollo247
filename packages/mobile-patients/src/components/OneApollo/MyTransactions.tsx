import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { NavigationActions, NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TxnIcon } from '@aph/mobile-patients/src/components/ui/Icons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface MyTransactionsProps {}

export const MyTransactions: React.FC<MyTransactionsProps> = (props) => {
  const [earned, setEarned] = useState<String>('100');
  const [redeemed, setRedeemed] = useState<String>('0');
  const [txns, settxns] = useState<any>(['1', '', '']);

  const rendertxnsHeader = () => {
    return (
      <View style={styles.txnsHeader}>
        <View style={styles.containerLeft}>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(13), color: '#525252' }}>
            Total Earned
          </Text>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(17), color: '#01475b', marginTop: 5 }}>
            {earned} Credits
          </Text>
        </View>
        <View style={styles.containerRight}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(13),
              color: '#525252',
              paddingLeft: 0.1 * windowWidth,
            }}
          >
            Total Redeemed
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(17),
              color: '#01475b',
              marginTop: 5,
              paddingLeft: 0.1 * windowWidth,
            }}
          >
            {redeemed} Credits
          </Text>
        </View>
      </View>
    );
  };

  const renderTxncard = (item: any) => {
    return (
      <View style={styles.txnCard}>
        <View style={{ flex: 0.1 }}>
          <TxnIcon style={{ height: 26, width: 24, marginTop: 5 }} />
        </View>
        <View style={{ flex: 0.45 }}>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), color: '#000000', lineHeight: 22 }}>
            Apollo Hospitals
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(14),
              color: '#666666',
              marginTop: 3,
              lineHeight: 22,
            }}
          >
            24 May 2020
          </Text>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), color: '#666666', marginTop: 12 }}>
            Billing Rs. 200
          </Text>
        </View>
        <View style={{ flex: 0.25, alignItems: 'flex-end' }}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(14),
              color: theme.colors.SEARCH_UNDERLINE_COLOR,
              lineHeight: 22,
            }}
          >
            Earned
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(14),
              color: theme.colors.REDEEMED_TEXT,
              marginTop: 3,
              lineHeight: 22,
            }}
          >
            Redeemed
          </Text>
        </View>
        <View style={{ flex: 0.2, alignItems: 'flex-end' }}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(17),
              color: theme.colors.LIGHT_BLUE,
              lineHeight: 22,
            }}
          >
            20
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(17),
              color: theme.colors.LIGHT_BLUE,
              marginTop: 3,
              lineHeight: 22,
            }}
          >
            30
          </Text>
        </View>
      </View>
    );
  };
  const renderTxns = () => {
    if (txns.length) {
      return (
        <View>
          {txns.map((item: any) => {
            return renderTxncard(item);
          })}
        </View>
      );
    } else {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.notxns}>You have no transactions</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {rendertxnsHeader()}
        {renderTxns()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.viewStyles.container,
    backgroundColor: '#fff',
    marginHorizontal: 0.05 * windowWidth,
  },
  txnsHeader: {
    height: 90,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerLeft: {
    flex: 0.5,
    height: 45,
    borderRightWidth: 1,
    borderRightColor: '#e5e5e5',
  },
  containerRight: {
    flex: 0.5,
    height: 45,
  },
  notxns: {
    ...theme.fonts.IBMPlexSansMedium(14),
    color: '#666666',
    marginTop: 30,
  },
  txnCard: {
    flexDirection: 'row',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
});
