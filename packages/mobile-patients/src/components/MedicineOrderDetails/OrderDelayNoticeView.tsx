import { getPharmaOrderMessage } from '@aph/mobile-patients/src/components/MedicineOrderDetails';
import { OrderDelayNotice } from '@aph/mobile-patients/src/components/ui/OrderDelayNotice';
import { OrderDelayNoticeShimmer } from '@aph/mobile-patients/src/components/ui/ShimmerFactory';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { pharmaOrderMessage_pharmaOrderMessage } from '@aph/mobile-patients/src/graphql/types/pharmaOrderMessage';
import React, { useEffect, useState } from 'react';
import { useApolloClient } from 'react-apollo-hooks';
import { StyleSheet, View, ViewProps } from 'react-native';

export interface Props {
  orderId: number;
  containerStyle?: ViewProps['style'];
}

const _OrderDelayNoticeView: React.FC<Props> = ({ orderId, containerStyle }) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<pharmaOrderMessage_pharmaOrderMessage | null>(null);
  const client = useApolloClient();

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    try {
      setLoading(true);
      const response = await getPharmaOrderMessage(client, { orderId });
      setResponse(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      CommonBugFender('OrderDelayNoticeView_fetch', error);
    }
  };

  const showNotice = !!(response?.message || response?.title);

  return (
    <View style={[loading && styles.container, containerStyle]}>
      {loading && <OrderDelayNoticeShimmer />}
      {!loading && showNotice && (
        <OrderDelayNotice
          containerStyle={styles.container}
          title={response?.title!}
          description={response?.message!}
        />
      )}
    </View>
  );
};

export const OrderDelayNoticeView = React.memo(_OrderDelayNoticeView);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
});
