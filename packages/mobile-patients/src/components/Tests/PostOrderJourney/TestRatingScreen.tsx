import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { Card } from '@aph/mobile-patients/src/components/ui/Card';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { Spinner } from '@aph/mobile-patients/src/components/ui/Spinner';
import { getReviewTag, sourceHeaders } from '@aph/mobile-patients/src/utils/commonUtils';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import {
  GET_CUSTOMIZED_DIAGNOSTIC_SLOTS,
  GET_INTERNAL_ORDER,
  GET_PATIENT_ADDRESS_BY_ID,
  RESCHEDULE_DIAGNOSTIC_ORDER,
  GET_DIAGNOSTIC_ORDERS_LIST_BY_MOBILE,
  GET_PHLOBE_DETAILS,
} from '@aph/mobile-patients/src/graphql/profiles';
import { getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  getDiagnosticOrdersListByMobile,
  getDiagnosticOrdersListByMobileVariables,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrdersStatus,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

import { CANCEL_DIAGNOSTIC_ORDER } from '@aph/mobile-patients/src/graphql/profiles';
import { useAllCurrentPatients, useAuth } from '@aph/mobile-patients/src/hooks/authHooks';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
  BackHandler,
  Text,
  Modal,
} from 'react-native';
import { UserOutline, StarEmptyGreen, StarFillGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { NavigationScreenProps } from 'react-navigation';
import {
  CancellationDiagnosticsInput,
  DIAGNOSTIC_ORDER_PAYMENT_TYPE,
  DIAGNOSTIC_ORDER_STATUS,
  MedicalRecordType,
  RescheduleDiagnosticsInput,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { useApolloClient } from 'react-apollo-hooks';
import {
  g,
  handleGraphQlError,
  nameFormater,
  TestSlot,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DisabledTickIcon, TickIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  AppConfig,
  BLACK_LIST_CANCEL_STATUS_ARRAY,
  BLACK_LIST_RESCHEDULE_STATUS_ARRAY,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  TestCancelReasons,
  TestReschedulingReasons,
} from '@aph/mobile-patients/src/strings/AppConfig';
import { CommonBugFender } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { useUIElements } from '@aph/mobile-patients/src/components/UIElementsProvider';
import _ from 'lodash';
import {
  cancelDiagnosticsOrder,
  cancelDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/cancelDiagnosticsOrder';
import { TestSlotSelectionOverlay } from '@aph/mobile-patients/src/components/Tests/components/TestSlotSelectionOverlay';
import {
  rescheduleDiagnosticsOrder,
  rescheduleDiagnosticsOrderVariables,
} from '@aph/mobile-patients/src/graphql/types/rescheduleDiagnosticsOrder';
import {
  getPatientAddressById,
  getPatientAddressByIdVariables,
} from '@aph/mobile-patients/src/graphql/types/getPatientAddressById';
import {
  getOrderInternal,
  getOrderInternalVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderInternal';
import {
  DiagnosticRescheduleOrder,
  DiagnosticViewReportClicked,
} from '@aph/mobile-patients/src/components/Tests/Events';
import {
  getDiagnosticSlotsCustomized,
  getDiagnosticSlotsCustomizedVariables,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticSlotsCustomized';
import { OrderTestCard } from '@aph/mobile-patients/src/components/Tests/components/OrderTestCard';
import { getPatientPrismMedicalRecordsApi } from '@aph/mobile-patients/src/helpers/clientCalls';
import { Overlay } from 'react-native-elements';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { TextInputComponent } from '@aph/mobile-patients/src/components/ui/TextInputComponent';

import { GetCurrentPatients_getCurrentPatients_patients } from '@aph/mobile-patients/src/graphql/types/GetCurrentPatients';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList as orderListByMobile } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import {
  getOrderPhleboDetailsBulk,
  getOrderPhleboDetailsBulkVariables,
} from '@aph/mobile-patients/src/graphql/types/getOrderPhleboDetailsBulk';

export interface DiagnosticsOrderList
  extends getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList {
  maxStatus: string;
  maxTime?: string | undefined | null;
}

export interface TestRatingScreenProps extends NavigationScreenProps {
  showHeader?: boolean;
}

export const TestRatingScreen: React.FC<TestRatingScreenProps> = (props) => {
  const { loading, setLoading, showAphAlert, hideAphAlert } = useUIElements();
  const ratingStar = props.navigation.getParam('ratingStar');
  const starCount = [1,2,3,4,5];
  useEffect(() => {
    console.log('TestRatingScreen :>> ', ratingStar);
    setLoading!(false)
  }, [])
  
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={theme.viewStyles.container}>
        {props?.showHeader == false ? null : (
          <Header
            leftIcon="backArrow"
            title={string.orders.ratingHeader}
            container={{ borderBottomWidth: 0 }}
            onPressLeftIcon={() => props.navigation.goBack()}
          />
        )}
        <View style={styles.phleboDetails}>
          <UserOutline style={styles.icon}/>
          <Text style={styles.textStylePhlebo}>Phlebotomist • Ramkumar sharma</Text>
        </View>
        <Text style={styles.textStyleHeading}>{string.orders.ratingDetailHeader}</Text>
        <View style={styles.startContainer}>
        {starCount.map((item) => (
            <TouchableOpacity onPress={()=>{
              // props.onPressRatingStar(item)
            }}>
              <StarEmptyGreen style={styles.startStyle} />
            </TouchableOpacity>
          ))}
          </View>
          <View>
            <Text>{getReviewTag(ratingStar)}</Text>
          </View>
        <ScrollView bounces={false} scrollEventThrottle={1}></ScrollView>
      </SafeAreaView>
      {loading && !props?.showHeader ? null : loading && <Spinner />}
    </View>
  );
};

const styles = StyleSheet.create({
  phleboDetails: {
    flexDirection:'row',
    alignSelf:'center',
    width:'95%',
    alignItems:'center',
    justifyContent:'center',
    padding:15
  },
  icon: {
    width:22,
    height:22,
    margin:10
  },
  textStylePhlebo: {
    ...theme.viewStyles.text('SB', 13, colors.SHERPA_BLUE, 1, 18),
  },
  textStyleHeading: {
    ...theme.viewStyles.text('R', 14, colors.SHERPA_BLUE, 1, 18),
    textAlign:'center'
  },
  startContainer: {
    justifyContent:'center',
    flexDirection:'row',
    margin:5,
    paddingTop:10
  },
  startStyle:{
    width:30,
    height:30,
    margin:5
  }
});
