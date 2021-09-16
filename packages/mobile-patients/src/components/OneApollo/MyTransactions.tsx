import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { NavigationActions, NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { TxnIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import { useApolloClient } from 'react-apollo-hooks';
import { GET_ONEAPOLLO_USERTXNS } from '@aph/mobile-patients/src/graphql/profiles';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { format } from 'date-fns';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export interface MyTransactionsProps {
  earned: number;
  redeemed: number;
  fetchFailed: boolean;
}

export const MyTransactions: React.FC<MyTransactionsProps> = (props) => {
  const [earned, setEarned] = useState<number>(props.earned);
  const [redeemed, setRedeemed] = useState<number>(props.redeemed);
  const [loading, setLoading] = useState<boolean>(true);
  const [txns, settxns] = useState<any>([]);
  const client = useApolloClient();
  const { showAphAlert } = useUIElements();

  useEffect(() => {
    client
      .query({
        query: GET_ONEAPOLLO_USERTXNS,
        fetchPolicy: 'no-cache',
      })
      .then((res) => {
        settxns(res.data.getOneApolloUserTransactions);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        CommonBugFender('fetchingOneApolloUserTxns', error);
      });
  }, []);

  const renderErrorPopup = (desc: string) =>
    showAphAlert!({
      title: 'Uh oh.. :(',
      description: `${desc || ''}`.trim(),
    });

  const rendertxnsHeader = () => {
    return (
      <View style={styles.txnsHeader}>
        <View style={styles.containerLeft}>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(13), color: '#525252' }}>
            Total Earned
          </Text>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), color: '#01475b', marginTop: 5 }}>
            {!props.fetchFailed ? (earned || 0).toFixed(2) : '--'}
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
              ...theme.fonts.IBMPlexSansMedium(14),
              color: '#01475b',
              marginTop: 5,
              paddingLeft: 0.1 * windowWidth,
            }}
          >
            {!props.fetchFailed ? (redeemed || 0).toFixed(2) : '--'}
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
        <View style={{ flex: 0.4 }}>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), color: '#000000', lineHeight: 22 }}>
            {item.businessUnit}
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(14),
              color: '#666666',
              marginTop: 3,
              lineHeight: 22,
            }}
          >
            {format(item.transactionDate, 'DD MMM YYYY')}
          </Text>
          <Text style={{ ...theme.fonts.IBMPlexSansMedium(14), color: '#666666', marginTop: 12 }}>
            Billing {string.common.Rs} {convertNumberToDecimal(item?.netAmount + item?.redeemedHC)}
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
        <View style={{ flex: 0.25, alignItems: 'flex-end' }}>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(17),
              color: theme.colors.LIGHT_BLUE,
              lineHeight: 22,
            }}
          >
            {item.earnedHC}
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansSemiBold(17),
              color: theme.colors.LIGHT_BLUE,
              marginTop: 3,
              lineHeight: 22,
            }}
          >
            {item.redeemedHC}
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
      {loading ? (
        <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner style={{ backgroundColor: '#fff' }} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {rendertxnsHeader()}
          {renderTxns()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
