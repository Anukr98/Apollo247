import { Breadcrumb } from '@aph/mobile-patients/src/components/MedicineListing/Breadcrumb';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Helpers as NeedHelpHelpers } from '@aph/mobile-patients/src/components/NeedHelp';
import { ConsultCard } from '@aph/mobile-patients/src/components/NeedHelpConsultOrder';
import { AphListItem } from '@aph/mobile-patients/src/components/ui/AphListItem';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { RetryCard } from '@aph/mobile-patients/src/components/ui/RetryCard';
import { GET_PATIENT_ALL_APPOINTMENTS_FOR_HELP } from '@aph/mobile-patients/src/graphql/profiles';
import {
  GetPatientAllAppointmentsForHelp,
  GetPatientAllAppointmentsForHelpVariables,
  GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments,
} from '@aph/mobile-patients/src/graphql/types/GetPatientAllAppointmentsForHelp';
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
  }> {}

type Consult = GetPatientAllAppointmentsForHelp_getPatientAllAppointments_appointments;

export const NeedHelpConsultOrder: React.FC<Props> = ({ navigation }) => {
  const pageTitle = navigation.getParam('pageTitle') || string.consult.toUpperCase();
  const queryIdLevel1 = navigation.getParam('queryIdLevel1') || NaN;
  const email = navigation.getParam('email') || '';
  const queries = navigation.getParam('queries');
  const breadCrumb = [{ title: string.needHelp }, { title: string.consult }];

  const { currentPatient } = useAllCurrentPatients();
  const [displayAll, setDisplayAll] = useState<boolean>(false);

  const ordersQuery = useQuery<
    GetPatientAllAppointmentsForHelp,
    GetPatientAllAppointmentsForHelpVariables
  >(GET_PATIENT_ALL_APPOINTMENTS_FOR_HELP, {
    variables: { patientId: currentPatient?.id },
    fetchPolicy: 'no-cache',
  });
  const { data, loading, error } = ordersQuery;
  const orders = data?.getPatientAllAppointments?.appointments || [];

  const renderHeader = () => {
    const onPressBack = () => navigation.goBack();
    return <Header title={pageTitle} leftIcon="backArrow" onPressLeftIcon={onPressBack} />;
  };

  const renderBreadCrumb = () => {
    return <Breadcrumb links={breadCrumb} containerStyle={styles.breadcrumb} />;
  };

  const renderRecentOrder = () => {
    return <Text style={styles.recentOrder}>{string.recentConsults}</Text>;
  };

  const renderLoader = () => {
    return (
      <View style={styles.loader}>
        <FacebookLoader loading={loading} active />
      </View>
    );
  };

  const renderItem = ({ item }: ListRenderItemInfo<Consult>) => {
    const onPressHelp = () => {
      navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
        isOrderRelatedIssue: true,
        medicineOrderStatus: item.status,
        orderId: item.displayId,
        queryIdLevel1,
        email,
        isConsult: true,
        queries,
      });
    };
    const onPress = () => {};
    return <ConsultCard consult={item} onPress={onPress} onPressHelp={onPressHelp} />;
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
        <AphListItem
          title={string.chooseFromPreviousConsults}
          onPress={() => setDisplayAll(true)}
        />
      )
    );
  };

  const renderDivider = () => {
    return <Divider style={styles.divider} />;
  };

  const renderHelperText = () => {
    return (
      displayAll && <Text style={styles.helperText}>{string.ifYourConsultTransactionFailed}</Text>
    );
  };

  const renderIssueNotRelatedToOrder = () => {
    const onPress = () => {
      navigation.navigate(AppRoutes.NeedHelpQueryDetails, {
        isOrderRelatedIssue: false,
        queryIdLevel1,
        email,
        isConsult: true,
        queries,
        pathFollowed: string.otherIssueNotMyConsults + ' - ',
      });
    };
    return <AphListItem title={string.otherIssueNotMyConsults} onPress={onPress} />;
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
