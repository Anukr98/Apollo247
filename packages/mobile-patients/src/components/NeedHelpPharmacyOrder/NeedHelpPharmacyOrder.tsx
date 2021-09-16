import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { OrderCard } from '@aph/mobile-patients/src/components/NeedHelpPharmacyOrder';
import { AphListItem } from '@aph/mobile-patients/src/components/ui/AphListItem';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { RetryCard } from '@aph/mobile-patients/src/components/ui/RetryCard';
import { formatOrders, MedOrder } from '@aph/mobile-patients/src/components/YourOrdersScene';
import { GET_MEDICINE_ORDERS_OMS__LIST } from '@aph/mobile-patients/src/graphql/profiles';
import {
  getMedicineOrdersOMSList,
  getMedicineOrdersOMSListVariables,
} from '@aph/mobile-patients/src/graphql/types/getMedicineOrdersOMSList';
import {
  WebEngageEventName,
  WebEngageEvents,
} from '@aph/mobile-patients/src/helpers/webEngageEvents';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import { useQuery } from 'react-apollo-hooks';
import { FlatList, ListRenderItemInfo, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FacebookLoader } from 'react-native-easy-content-loader';
import { Divider } from 'react-native-elements';
import { NavigationScreenProps } from 'react-navigation';

export interface Props
  extends NavigationScreenProps<{
    pageTitle?: string;
    queryIdLevel1: string;
    email: string;
    queries: NeedHelpHelpers.HelpSectionQuery[];
    sourcePage: WebEngageEvents[WebEngageEventName.HELP_TICKET_SUBMITTED]['Source_Page'];
  }> {}

export const NeedHelpPharmacyOrder: React.FC<Props> = ({ navigation }) => {
  const sourcePage = navigation.getParam('sourcePage');
  const pageTitle = navigation.getParam('pageTitle') || string.pharmacy.toUpperCase();
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || '';
  const email = navigation.getParam('email') || '';
  const queries = navigation.getParam('queries');

  const breadCrumb = [{ title: string.needHelp }, { title: string.pharmacy }];

  const { currentPatient } = useAllCurrentPatients();
  const [displayAll, setDisplayAll] = useState<boolean>(false);

  const ordersQuery = useQuery<getMedicineOrdersOMSList, getMedicineOrdersOMSListVariables>(
    GET_MEDICINE_ORDERS_OMS__LIST,
    { variables: { patientId: currentPatient?.id }, fetchPolicy: 'no-cache' }
  );
  const { data, loading, error } = ordersQuery;
  const orders = formatOrders(data) as MedOrder[];

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderBreadCrumb = () => {
    return <Breadcrumb links={breadCrumb} containerStyle={styles.breadcrumb} />;
  };

  const renderRecentOrder = () => {
    return <Text style={styles.recentOrder}>{string.recentOrders}</Text>;
  };

  const renderLoader = () => {
    return (
      <View style={styles.loader}>
        <FacebookLoader loading={loading} active />
      </View>
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<MedOrder>) => {
    const onPressHelp = () => {
      const currentStatusDate = item?.medicineOrdersStatus?.find(
        (i) => i?.orderStatus === item?.currentStatus
      )?.statusDate;
      navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
        isOrderRelatedIssue: true,
        medicineOrderStatus: item.currentStatus,
        medicineOrderStatusDate: currentStatusDate,
        orderId: item.billNumber || item.orderAutoId,
        queryIdLevel1,
        queries,
        email,
        sourcePage,
      });
    };
    const onPress = (isCancelOrder?: boolean) => {
      navigation.navigate(AppRoutes.OrderDetailsScene, {
        orderAutoId: item.orderAutoId,
        billNumber: item.billNumber,
        isCancelOrder: !!isCancelOrder,
        queryIdLevel1,
        queries,
        email,
      });
    };
    return (
      <OrderCard
        orderDetail={item}
        onPress={() => onPress(false)}
        onPressCancel={() => onPress(true)}
        onPressHelp={onPressHelp}
      />
    );
  };

  const renderOrders = () => {
    const data = displayAll ? orders : orders.slice(0, 1);
    return (
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, i) => `${i}`}
        bounces={false}
        removeClippedSubviews={true}
        ListFooterComponent={renderSections(!displayAll)}
      />
    );
  };

  const renderError = () => {
    return !!error && <RetryCard />;
  };

  const renderChooseFromPrevious = () => {
    const visible = !displayAll && orders.length > 1;
    return (
      visible && (
        <AphListItem title={string.chooseFromPreviousOrders} onPress={() => setDisplayAll(true)} />
      )
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderHelperText = () => {
    return displayAll && <Text style={styles.helperText}>{string.ifYourOrderFailed}</Text>;
  };

  const renderIssueNotRelatedToOrder = () => {
    const onPress = () => {
      navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
        queryIdLevel1,
        queries,
        email,
        sourcePage,
        pathFollowed: string.otherIssueNotMyOrders + ' - ',
      });
    };
    return <AphListItem title={string.otherIssueNotMyOrders} onPress={onPress} />;
  };

  const renderSections = (visible: boolean) => {
    return visible ? (
      <>
        {renderChooseFromPrevious()}
        {renderDivider()}
        {renderHelperText()}
        {renderIssueNotRelatedToOrder()}
      </>
    ) : null;
  };

  return (
    <SafeAreaView style={container}>
      {renderHeader()}
      {renderBreadCrumb()}
      {renderRecentOrder()}
      {renderLoader()}
      {renderError()}
      {renderOrders()}
      {renderSections(displayAll)}
    </SafeAreaView>
  );
};

const { text, container } = theme.viewStyles;
const { LIGHT_BLUE } = theme.colors;
const styles = StyleSheet.create({
  breadcrumb: {
    marginHorizontal: 20,
  },
  divider: { marginVertical: 0, marginHorizontal: 20 },
  recentOrder: {
    ...text('M', 12, LIGHT_BLUE),
    marginHorizontal: 20,
    marginBottom: 8,
  },
  helperText: {
    ...text('L', 11, LIGHT_BLUE),
    marginHorizontal: 20,
    marginTop: 10,
  },
  loader: {
    marginHorizontal: 10,
  },
});
