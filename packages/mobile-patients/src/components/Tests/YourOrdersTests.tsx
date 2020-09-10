import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { GET_DIAGNOSTIC_ORDER_LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getDiagnosticOrdersList,
  getDiagnosticOrdersListVariables,
  getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavigationScreenProps, ScrollView, FlatList } from 'react-navigation';
import { TestOrderNewCard } from '../ui/TestOrderNewCard';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { ScrollableFooter } from '../ui/ScrollableFooter';

const styles = StyleSheet.create({
  noDataCard: {
    height: 'auto',
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: 'white',
    elevation: 0,
  },
});

type TestOrder = getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList;

export interface YourOrdersTestProps extends NavigationScreenProps {}

export const YourOrdersTest: React.FC<YourOrdersTestProps> = (props) => {
  const { currentPatient } = useAllCurrentPatients();
  const { data, error, loading } = useQuery<
    getDiagnosticOrdersList,
    getDiagnosticOrdersListVariables
  >(GET_DIAGNOSTIC_ORDER_LIST, {
    variables: { patientId: currentPatient?.id },
    fetchPolicy: 'no-cache',
  });
  const orders =
    loading || error ? [] : (data?.getDiagnosticOrdersList?.ordersList as TestOrder[]) || [];

  const getSlotStartTime = (slot: string /*07:00-07:30 */) => {
    return moment((slot.split('-')[0] || '').trim(), 'hh:mm').format('hh:mm A');
  };

  const renderOrder = (order: TestOrder, index: number) => {
    const isHomeVisit = !!order.slotTimings;
    const dt = moment(order.diagnosticDate).format(`D MMM YYYY`);
    const tm = getSlotStartTime(order.slotTimings);
    const dtTm = `${dt}${isHomeVisit ? `, ${tm}` : ''}`;
    return (
      <TestOrderNewCard
        key={`${order.id}`}
        orderId={`${order.displayId}`}
        dateTime={`Scheduled For: ${dtTm}`}
        statusDesc={isHomeVisit ? 'Home Visit' : 'Clinic Visit'}
        isCancelled={order.orderStatus == DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED}
        onPress={() => {
          props.navigation.navigate(AppRoutes.TestOrderDetails, {
            orderId: order.id,
          });
        }}
        style={[
          { marginHorizontal: 20 },
          index < orders.length - 1 ? { marginBottom: 8 } : { marginBottom: 20 },
          index == 0 ? { marginTop: 20 } : {},
        ]}
      />
    );
  };

  const [scrollOffSet, setScrollOffSet] = useState<number>(0);
  const [show, setShow] = useState<boolean>(true);

  const onScrolling = (offSet: number) => {
    if (scrollOffSet > offSet) {
      if (!show) {
        setShow(true);
      }
    } else {
      setShow(false);
    }
    if (offSet <= 0) {
      setShow(true);
    }
    setScrollOffSet(offSet);
  };

  const renderOrders = () => {
    return (
      <FlatList
        bounces={false}
        data={orders}
        renderItem={({ item, index }) => renderOrder(item, index)}
        ListEmptyComponent={renderNoOrders()}
      />
    );
  };

  const renderNoOrders = () => {
    if (!loading && !error && orders.length == 0) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'No Orders Found!'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        >
          <Button
            style={{ marginTop: 20 }}
            title={'ORDER NOW'}
            onPress={() => {
              props.navigation.navigate(AppRoutes.SearchTestScene);
            }}
          />
        </Card>
      );
    }
  };

  const renderError = () => {
    if (error) {
      return (
        <Card
          cardContainer={[styles.noDataCard]}
          heading={'Uh oh! :('}
          description={'Something went wrong.'}
          descriptionTextStyle={{ fontSize: 14 }}
          headingTextStyle={{ fontSize: 14 }}
        />
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        <Header
          leftIcon="backArrow"
          title={string.orders.urOrders}
          container={{ borderBottomWidth: 0 }}
          onPressLeftIcon={() => props.navigation.goBack()}
        />
        <ScrollView
          bounces={false}
          onScroll={(i) => onScrolling(i.nativeEvent.contentOffset.y)}
          scrollEventThrottle={1}
        >
          {renderError()}
          {renderOrders()}
        </ScrollView>
        {!loading && <ScrollableFooter show={show} />}
      </SafeAreaView>
      {loading && <Spinner />}
    </View>
  );
};
