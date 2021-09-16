/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import PaymentHistoryCard from './PaymentHistoryCard';
import NoPaymentsScreen from './NoPaymentsScreen';
import {
  CONSULT_ORDER_PAYMENT_DETAILS,
  PHARMACY_ORDER_PAYMENT_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { useApolloClient } from 'react-apollo-hooks';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { g } from '@aph/mobile-patients/src//helpers/helperFunctions';

interface meta {
  total: number;
  pageSize: number;
  pageNo: number;
}
interface IProps {
  payments: any;
  type: string;
  navigationProps: any;
  patientId?: string;
  fromNotification?: boolean;
  meta: meta | undefined;
}
const PaymentsList: FC<IProps> = (props) => {
  const { payments, type, patientId, fromNotification, meta } = props;
  const [pageNo, setpageNo] = useState<number>(1);
  const [pageSize, setpageSize] = useState<number>(8);
  const [paymentsList, setpaymentsList] = useState(props.payments);
  const [fetching, setfetching] = useState<boolean>(false);
  const client = useApolloClient();

  const _renderAllPayments = ({ item, index }: any) => {
    return (
      <PaymentHistoryCard
        id={item.id}
        item={item}
        index={index}
        lastIndex={index === payments.length - 1}
        paymentFor={type}
        navigationProps={props.navigationProps}
        patientId={patientId}
        fromNotification={fromNotification}
      />
    );
  };

  if (!payments) {
    return <Spinner />;
  }
  if (!payments.length) {
    return <NoPaymentsScreen />;
  }
  const renderListFooter = () => {
    return (
      <View style={{ height: 50 }}>
        {fetching && <Spinner style={{ backgroundColor: colors.DEFAULT_BACKGROUND_COLOR }} />}
      </View>
    );
  };

  const onConsultEndReached = () => {
    if (meta && !fetching && paymentsList.length < meta.total) {
      setfetching(true);
      client
        .query({
          query: CONSULT_ORDER_PAYMENT_DETAILS,
          variables: {
            patientId: patientId,
            pageNo: pageNo + 1,
            pageSize: pageSize,
          },
          fetchPolicy: 'no-cache',
        })
        .then((res) => {
          if (res.data) {
            let array = paymentsList;
            array = array.concat(
              g(res.data, 'consultOrders', 'appointments')?.filter(
                (item) => item.appointmentType === 'ONLINE'
              )
            );
            setpaymentsList(array);
            setpageNo(pageNo + 1);
          }
        })
        .catch((error) => {
          CommonBugFender('fetchingConsultPayments', error);
        })
        .finally(() => setfetching(false));
    }
  };

  const onPharmaEndReached = () => {
    if (!fetching && paymentsList.length < meta.total) {
      setfetching(true);
      client
        .query({
          query: PHARMACY_ORDER_PAYMENT_DETAILS,
          variables: {
            patientId: patientId,
            pageNo: pageNo + 1,
            pageSize: pageSize,
          },
          fetchPolicy: 'no-cache',
        })
        .then((res) => {
          if (res.data) {
            let array = paymentsList;
            array = array.concat(g(res.data, 'pharmacyOrders', 'pharmaOrders'));
            setpaymentsList(array);
            setpageNo(pageNo + 1);
          }
        })
        .catch((error) => {
          CommonBugFender('fetchingConsultPayments', error);
        })
        .finally(() => setfetching(false));
    }
  };

  const onEndReached = () => {
    if (type == 'consult') {
      onConsultEndReached();
    } else {
      onPharmaEndReached();
    }
  };
  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={paymentsList}
        renderItem={_renderAllPayments}
        keyExtractor={(item) => item.id}
        refreshing={false}
        onEndReachedThreshold={0.2}
        onEndReached={(info: { distanceFromEnd: number }) => {
          onEndReached();
        }}
        ListFooterComponent={renderListFooter()}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
});

export default PaymentsList;
