import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';
import { getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { InfoIconRed } from '@aph/mobile-patients/src/components/ui/Icons';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DIAGNOSTIC_ORDER_FAILED_STATUS } from '@aph/mobile-patients/src/strings/AppConfig';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';

const screenWidth = Dimensions.get('window').width;

interface OrderTestCardProps {
  orderId: string | number;
  key: string | number;
  createdOn: string | Date;
  orderLevelStatus: DIAGNOSTIC_ORDER_STATUS;
  patientName: string;
  gender: string;
  showAddTest: boolean;
  ordersData: any;
  showPretesting: boolean;
  dateTime: string;
  slotTime: string;
  isPrepaid: boolean;
  price: string | number;
  style?: StyleProp<ViewStyle>;
  isCancelled?: boolean;
  cancelledReason?: any;
  showRescheduleCancel?: boolean;
  showReportOption: boolean;
  showAdditonalView: boolean;
  additonalRejectedInfo?: any;
  onPressCard: () => void;
  onPressReschedule: () => void;
  onPressViewDetails: () => void;
  onPressAddTest?: () => void;
  onPressViewReport: () => void;
  phelboObject?: any;
}

export const OrderTestCard: React.FC<OrderTestCardProps> = (props) => {
  const [moreTests, setMoreTests] = useState<boolean>(false);

  const bookedOn = moment(props?.createdOn)?.format('Do MMM') || null;
  const renderTopView = () => {
    return (
      <View style={styles.horizontalRow}>
        <View style={{ flex: 0.8 }}>
          {!!props.orderId && <Text style={styles.orderIdText}>Order ID #{props.orderId}</Text>}
          {!!bookedOn && <Text style={styles.bookedOnText}>Booked on {bookedOn}</Text>}
        </View>
        {!!props?.orderLevelStatus && <StatusCard titleText={props?.orderLevelStatus!} />}
      </View>
    );
  };

  const renderMidView = () => {
    return (
      <View style={styles.midViewContainer}>
        {!!props.patientName && (
          <View>
            <Text style={styles.testForText}>Tests for {props.patientName}</Text>
          </View>
        )}
        {props.showAddTest ? (
          <TouchableOpacity activeOpacity={1} onPress={props.onPressAddTest}>
            <Text style={styles.yellowText}>ADD TEST</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderTestListView = () => {
    return (
      <View style={styles.listViewContainer}>
        {renderTestNames()}
        {props.showReportOption ? renderViewReport() : null}
      </View>
    );
  };

  const renderTestNames = () => {
    return (
      <>
        {props.ordersData?.map(
          (
            item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
            index: number
          ) => (
            <View style={styles.rowStyle}>
              {index < 2 && !moreTests ? (
                <>
                  <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                  <Text style={styles.testName}>
                    {!!item?.itemName
                      ? nameFormater(item?.itemName!, 'title')
                      : !!item?.diagnostics?.itemName
                      ? nameFormater(item?.diagnostics?.itemName!, 'title')
                      : ''}{' '}
                    {index == 1 &&
                      props.ordersData?.length - 2 > 0 &&
                      renderShowMore(props.ordersData, item?.itemName!)}
                  </Text>
                </>
              ) : null}
            </View>
          )
        )}
        {moreTests &&
          props.ordersData?.map(
            (
              item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
              index: number
            ) => (
              <>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                  <Text style={styles.testName}>
                    {!!item?.itemName ? nameFormater(item?.itemName!, 'title') : ''}{' '}
                  </Text>
                </View>
              </>
            )
          )}
        {moreTests && (
          <Text onPress={() => setMoreTests(!moreTests)} style={styles.showLessText}>
            SHOW LESS
          </Text>
        )}
      </>
    );
  };

  const renderShowMore = (orderData: any, name: string) => {
    return (
      <Text
        onPress={() => setMoreTests(!moreTests)}
        style={[
          styles.moreText,
          {
            ...theme.viewStyles.text(
              'SB',
              isSmallDevice ? (name?.length > 25 ? 10 : 12) : name?.length > 25 ? 11 : 13,
              theme.colors.APP_YELLOW,
              1,
              18
            ),
          },
        ]}
      >
        {'   '}
        {!moreTests && `+${orderData?.length - 2} MORE`}
      </Text>
    );
  };

  const renderViewReport = () => {
    return (
      <Button
        title={'VIEW REPORT'}
        style={styles.viewReport}
        titleTextStyle={{
          ...theme.viewStyles.text('SB', isIphone5s() ? 12 : 14, theme.colors.BUTTON_TEXT),
        }}
        onPress={props.onPressViewReport}
      />
    );
  };

  const renderPreparationData = () => {
    //remove duplicate test prep data.
    const getPrepData = props.ordersData?.map(
      (item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems) =>
        item?.itemObj?.testPreparationData || item?.diagnostics?.testPreparationData!
    );
    const filterData = [...new Set(getPrepData)];
    return (
      <>
        {filterData?.map((item: any) => {
          return (
            <>
              {item != '' && (
                <View style={styles.preparationViewContainer}>
                  <InfoIconRed style={styles.infoIconStyle} />
                  <Text style={styles.preparationText}>{nameFormater(item, 'default')}</Text>
                </View>
              )}
            </>
          );
        })}
      </>
    );
  };

  const renderBottomView = () => {
    const bookedForDate = !!props.dateTime
      ? moment(props.dateTime)?.format('ddd, DD MMM YYYY') || null
      : null;
    const bookedForTime = moment(props.slotTime).format('hh:mm a');

    return (
      <View style={styles.bottomContainer}>
        {(!!bookedForTime || !!bookedForDate) && (
          <View>
            <Text style={styles.headingText}>Appointment Time</Text>
            {!!bookedForTime ? <Text style={styles.slotText}>{bookedForTime}</Text> : null}
            {!!bookedForDate ? <Text style={styles.slotText}>{bookedForDate}</Text> : null}
          </View>
        )}
        <View>
          <Text style={styles.headingText}>Payment</Text>
          <Text style={[styles.slotText, { textAlign: 'right' }]}>
            {props.isPrepaid ? 'ONLINE' : 'COD'}
          </Text>
          {!!props?.price ? (
            <Text style={[styles.slotText, { textAlign: 'right' }]}>
              {string.common.Rs}
              {convertNumberToDecimal(props?.price)}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderCTAsView = () => {
    return (
      <View
        style={[
          styles.ctaContainer,
          { justifyContent: props.showRescheduleCancel ? 'space-between' : 'flex-end' },
        ]}
      >
        {!!props.showRescheduleCancel && props.showRescheduleCancel ? (
          <TouchableOpacity activeOpacity={1} onPress={props.onPressReschedule}>
            <Text style={[styles.yellowText, { fontSize: screenWidth > 380 ? 14 : 13 }]}>
              RESCHEDULE
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity activeOpacity={1} onPress={props.onPressViewDetails}>
          <Text style={[styles.yellowText, { fontSize: screenWidth > 380 ? 14 : 13 }]}>
            VIEW DETAILS
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const showOTPContainer = () => {
    const phlObj = props?.phelboObject;
    let otpToShow = !!phlObj && phlObj?.PhelboOTP;

    return (
      <>
        {!!otpToShow ? (
          <View style={styles.otpContainer}>
            <Text style={styles.otpTextStyle}>{'OTP : '}</Text>
            <Text style={styles.otpTextStyle}>{otpToShow}</Text>
          </View>
        ) : null}
      </>
    );
  };

  const renderAdditionalInfoView = () => {
    const isPresent =
      (!!props.additonalRejectedInfo && props.additonalRejectedInfo?.length > 0) ||
      (props.isCancelled && props.cancelledReason != null);
    const consRejectedString = isPresent && props.additonalRejectedInfo?.join(', ');
    let textToShow =
      props.isCancelled && props.cancelledReason != null
        ? `${string.diagnostics.orderCancelledReasonText} ${
            !!props.cancelledReason?.comments && props.cancelledReason?.comments != ''
              ? props.cancelledReason?.comments
              : props.cancelledReason.cancellationReason === 'DIAGNOSTIC_STATUS_UPDATED_FROM_ITDOSE'
              ? string.diagnostics.itDoseCancelledText
              : props.cancelledReason?.cancellationReason
          }`
        : `Sample for ${consRejectedString} ${
            props.additonalRejectedInfo?.length > 1 ? 'are' : 'is'
          } rejected`;
    return (
      <>
        {isPresent ? (
          <View style={styles.preparationViewContainer}>
            <Text style={styles.preparationText}>{nameFormater(textToShow, 'default')}</Text>
          </View>
        ) : null}
      </>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={props.onPressCard}
      style={[styles.containerStyle, props.style]}
      key={props?.key?.toString()}
    >
      <View key={props?.key?.toString()} style={{ padding: 16, paddingBottom: 12 }}>
        {renderTopView()}
        {renderMidView()}
        {!!props.ordersData && props.ordersData?.length > 0 ? renderTestListView() : null}
        {!!props.ordersData && props.ordersData?.length > 0 ? renderPreparationData() : null}
        {!!props.orderLevelStatus && DIAGNOSTIC_ORDER_FAILED_STATUS.includes(props.orderLevelStatus)
          ? null
          : renderBottomView()}
        {renderCTAsView()}
      </View>
      {props.showAdditonalView || props.isCancelled ? renderAdditionalInfoView() : null}
      {showOTPContainer()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    margin: 16,
  },
  titleStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    paddingHorizontal: 16,
  },
  bulletStyle: {
    color: '#007C9D',
    fontSize: 5,
    textAlign: 'center',
    alignSelf: 'center',
  },
  testName: {
    ...theme.viewStyles.text('M', isSmallDevice ? 11.5 : 12, '#007C9D', 1, 17),
    letterSpacing: 0,
    marginBottom: '1.5%',
    marginHorizontal: '3%',
  },
  moreText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
  },
  showLessText: {
    ...theme.viewStyles.text('M', isSmallDevice ? 12 : 13, theme.colors.APP_YELLOW, 1, 15),
    letterSpacing: 0.25,
    marginBottom: '1.5%',
    marginTop: '2%',
    marginLeft: '5%',
  },
  infoIconStyle: { resizeMode: 'contain', height: 18, width: 18 },
  headingText: {
    ...theme.viewStyles.text('SB', 12, colors.SHERPA_BLUE, 1, 18),
    letterSpacing: 0.3,
    marginBottom: '2%',
  },
  slotText: {
    ...theme.viewStyles.text('R', 12, colors.SHERPA_BLUE, 1, 18),
    letterSpacing: 0.01,
    marginVertical: '1%',
  },
  itemHeading: {
    ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 15),
    letterSpacing: 0.28,
  },
  horizontalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  orderIdText: { ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18) },
  bookedOnText: { ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 0.5, 14) },
  midViewContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: '2%',
  },
  testForText: {
    ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18),
    letterSpacing: 0.3,
  },
  yellowText: { ...theme.viewStyles.yellowTextStyle, fontSize: screenWidth > 380 ? 13 : 12 },
  listViewContainer: { backgroundColor: '#F9F9F9', borderRadius: 5, flex: 1, padding: 10 },
  rowStyle: { flexDirection: 'row' },
  preparationViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#FCFDDA',
    flex: 1,
    padding: 10,
  },
  preparationText: {
    ...theme.fonts.IBMPlexSansMedium(10),
    lineHeight: 18,
    letterSpacing: 0.1,
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.7,
    marginHorizontal: '2%',
  },
  ctaContainer: {
    marginVertical: '3%',
    flexDirection: 'row',
  },
  bottomContainer: { justifyContent: 'space-between', flexDirection: 'row', marginTop: '6%' },
  viewReport: {
    width: '40%',
    marginBottom: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
    height: 40,
  },
  otpTextStyle: {
    top: 10,
    left: 20,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansMedium(14),
  },
  otpContainer: {
    backgroundColor: '#FCFDDA',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    height: 40,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderRadius: 10,
  },
});
