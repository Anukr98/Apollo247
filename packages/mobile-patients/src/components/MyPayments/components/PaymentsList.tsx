/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import PaymentHistoryCard from './PaymentHistoryCard';
import { IPayment } from 'src/models/IPayment';
import NoPaymentsScreen from './NoPaymentsScreen';

interface IProps {
  payments: any;
  type: string;
  navigationProps: any;
  patientId?: string;
}

const PaymentsList: FC<IProps> = (props) => {
  const { payments, type, patientId } = props;
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
      />
    );
  };

  if (!payments) {
    return <Spinner />;
  }
  if (!payments.length) {
    return <NoPaymentsScreen />;
  }
  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={payments}
        renderItem={_renderAllPayments}
        keyExtractor={(item) => item.id}
        refreshing={false}
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