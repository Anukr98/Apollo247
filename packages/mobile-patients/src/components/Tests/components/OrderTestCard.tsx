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
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import {
  checkPatientAge,
  isSmallDevice,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';
import {
  InfoIconRed,
  StarEmpty,
  ClockIcon,
  EditProfile,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { isIphone5s } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import {
  AppConfig,
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  DIAGNOSTIC_ORDER_FOR_PREPDATA,
  DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY,
  DIAGNOSTIC_SHOW_OTP_STATUS,
  DIAGNOSTIC_STATUS_BEFORE_SUBMITTED,
} from '@aph/mobile-patients/src/strings/AppConfig';
import {
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
  getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj,
} from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { AgentDetailsCard } from '@aph/mobile-patients/src/components/Tests/components/AgentDetailsCard';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';

const screenWidth = Dimensions.get('window').width;
interface OrderTestCardProps {
  orderId: string | number;
  key: string;
  createdOn: string | Date;
  orderLevelStatus: DIAGNOSTIC_ORDER_STATUS;
  patientName: string;
  gender: string;
  patientDetails: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_patientObj | null;
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
  isHelp?: boolean;
  orderAttributesObj?: any;
  slotDuration?: any;
  showEditIcon?: boolean;
  onPressRatingStar: (star: number) => void;
  onPressCallOption: (name: string, number: string) => void;
  onPressEditPatient: () => void;
  cancelRequestedReason?: string;
}

export const OrderTestCard: React.FC<OrderTestCardProps> = (props) => {
  const [moreTests, setMoreTests] = useState<boolean>(false);
  const { ordersData, orderLevelStatus } = props;
  //added if item is removed from phelbo app.
  const filterOrderLineItem =
    !!ordersData &&
    ordersData?.filter(
      (
        item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems
      ) => !item?.isRemoved
    );

  const bookedOn = moment(props?.createdOn)?.format('Do MMM') || null;
  //minor age -> can switch to any patient
  //major age  -> will have resriction

  const { currentPatient } = useAllCurrentPatients();
  const { isDiagnosticCircleSubscription } = useDiagnosticsCart();
  const isMinorAge = !!props.patientDetails ? checkPatientAge(props.patientDetails) : true;

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
    const showAddTest = props.showAddTest && !isMinorAge;
    return (
      <View style={[styles.midViewContainer, !showAddTest && { justifyContent: 'flex-start' }]}>
        {!!props.patientName && (
          <View style={styles.patientNameView}>
            <Text style={styles.testForText}>
              Tests for {props.gender != '' && props.gender} {props.patientName}
            </Text>
            {props.showEditIcon ? renderEditView() : null}
          </View>
        )}
        {showAddTest ? renderAddTestView() : null}
      </View>
    );
  };

  const renderEditView = () => {
    return (
      <View style={styles.editIconView}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={props.onPressEditPatient}
          style={styles.editIconTouch}
        >
          <EditProfile style={styles.editIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddTestView = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={props.onPressAddTest}
        style={styles.addTestTouch}
      >
        <Text style={styles.yellowText}>ADD MORE TEST</Text>
      </TouchableOpacity>
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
        {filterOrderLineItem?.map(
          (
            item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
            index: number
          ) => (
            <View style={styles.rowStyle}>
              {index < 2 && !moreTests ? (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      maxWidth: !!item?.editOrderID ? (screenWidth > 350 ? '68%' : '57%') : '80%',
                      flex: 1,
                    }}
                  >
                    <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                    <Text style={styles.testName}>
                      {!!item?.itemName
                        ? nameFormater(item?.itemName!, 'title')
                        : !!item?.diagnostics?.itemName
                        ? nameFormater(item?.diagnostics?.itemName!, 'title')
                        : ''}{' '}
                    </Text>
                    {!!item?.editOrderID ? renderNewTag() : null}
                    {index == 1 &&
                      filterOrderLineItem?.length - 2 > 0 &&
                      renderShowMore(filterOrderLineItem, item?.itemName!)}
                  </View>
                </>
              ) : null}
            </View>
          )
        )}
        {moreTests &&
          filterOrderLineItem?.map(
            (
              item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
              index: number
            ) => (
              <>
                <View style={{ flexDirection: 'row', width: '86%', flex: 1 }}>
                  <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                  <Text style={styles.testName}>
                    {!!item?.itemName ? nameFormater(item?.itemName!, 'title') : ''}{' '}
                  </Text>
                  {!!item?.editOrderID ? renderNewTag() : null}
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

  const renderNewTag = () => {
    return (
      <View style={styles.newItemView}>
        <Text style={styles.newText}>NEW</Text>
      </View>
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
    const getPrepData = filterOrderLineItem?.map(
      (
        item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems
      ) => item?.itemObj?.testPreparationData
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

    const bookedForTime = moment(props.slotTime)?.format('hh:mm A');
    const rangeAddedTime = moment(props.slotTime)
      ?.add(props.slotDuration, 'minutes')
      ?.format('hh:mm A');

    return (
      <View style={styles.bottomContainer}>
        {(!!bookedForTime || !!bookedForDate) && (
          <View>
            <Text style={styles.headingText}>Test Slot</Text>
            {!!bookedForTime ? (
              <Text style={styles.slotText}>
                {bookedForTime} - {rangeAddedTime}
              </Text>
            ) : null}
            {!!bookedForDate ? <Text style={styles.slotText}>{bookedForDate}</Text> : null}
          </View>
        )}
        {props.orderLevelStatus !== DIAGNOSTIC_ORDER_STATUS.PAYMENT_PENDING ? (
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
        ) : null}
      </View>
    );
  };

  const renderCTAsView = () => {
    return (
      <View
        style={[
          styles.ctaContainer,
          {
            justifyContent:
              props.showRescheduleCancel && !props.isHelp ? 'space-between' : 'flex-end',
          },
        ]}
      >
        {!!props.showRescheduleCancel && props.showRescheduleCancel && !props.isHelp ? (
          <TouchableOpacity activeOpacity={1} onPress={props.onPressReschedule}>
            <Text style={[styles.yellowText, { fontSize: screenWidth > 380 ? 14 : 13 }]}>
              RESCHEDULE | CANCEL
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity activeOpacity={1} onPress={props.onPressViewDetails}>
          <Text style={[styles.yellowText, { fontSize: screenWidth > 380 ? 14 : 13 }]}>
            {props.isHelp ? `HELP` : `VIEW DETAILS`}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const showDetailOTPContainer = () => {
    const phlObj = props?.phelboObject;
    const otpToShow = !!phlObj && phlObj?.phleboOTP;
    const showDetailedInfo = !!phlObj ? phlObj?.showPhleboDetails : false;
    const phleboDetailsETAText = !!phlObj && phlObj?.phleboDetailsETAText;

    return (
      <>
        {!!otpToShow && DIAGNOSTIC_SHOW_OTP_STATUS.includes(props.orderLevelStatus) ? (
          <>
            {showDetailedInfo
              ? renderPhleboDetails(phlObj)
              : !!phleboDetailsETAText && renderYellowSection(phleboDetailsETAText)}
          </>
        ) : null}
      </>
    );
  };

  const renderPhleboDetails = (phlObj: any) => {
    return (
      <AgentDetailsCard
        orderId={props.orderId}
        phleboDetailsObject={phlObj}
        orderLevelStatus={props.orderLevelStatus}
        currentPatient={currentPatient}
        isDiagnosticCircleSubscription={isDiagnosticCircleSubscription}
        onPressCallOption={(name, number) => props.onPressCallOption(name, number)}
        source={AppRoutes.YourOrdersTest}
      />
    );
  };

  const renderYellowSection = (text: string) => {
    return (
      <>
        {text != '' ? (
          <View style={styles.ratingContainer}>
            <Text style={{ ...theme.viewStyles.text('M', 12, colors.SHERPA_BLUE, 1, 16, 0.04) }}>
              {text}
            </Text>
          </View>
        ) : null}
      </>
    );
  };

  const showRatingView = () => {
    const starCount = [1, 2, 3, 4, 5];
    const phlObj = props?.phelboObject;
    const phleboRating = !!phlObj && phlObj?.phleboRating;
    let checkRating = starCount.includes(phleboRating);
    return !DIAGNOSTIC_STATUS_BEFORE_SUBMITTED.includes(props.orderLevelStatus) ? (
      !!checkRating ? null : (
        <View style={styles.ratingContainerN}>
          <Text style={styles.ratingTextStyleN}>Rate Apollo Agent</Text>
          <View style={styles.startContainerN}>
            {starCount.map((item) => (
              <TouchableOpacity
                onPress={() => {
                  props.onPressRatingStar(item);
                }}
              >
                <StarEmpty style={{ margin: 5 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )
    ) : null;
  };

  const showReportTat = () => {
    const isTatBreach =
      !!props?.orderAttributesObj?.expectedReportGenerationTime &&
      moment().isSameOrAfter(props?.orderAttributesObj?.expectedReportGenerationTime);
    const report = !!props?.orderAttributesObj?.reportTATMessage
      ? props?.orderAttributesObj?.reportTATMessage
      : !!props?.orderAttributesObj?.reportGenerationTime
      ? props?.orderAttributesObj?.reportGenerationTime
      : '';
    const prepData = !!props?.orderAttributesObj?.preTestingRequirement
      ? props?.orderAttributesObj?.preTestingRequirement
      : '';
    return DIAGNOSTIC_SAMPLE_SUBMITTED_STATUS_ARRAY.includes(props.orderLevelStatus) &&
      (report || prepData) ? (
      <View style={styles.ratingContainer}>
        {report ? (
          <View style={styles.reporttatContainer}>
            <ClockIcon />
            <Text style={styles.reportTextStyle}>{`${
              isTatBreach ? AppConfig.Configuration.DIAGNOSTICS_REPORT_TAT_BREACH_TEXT : report
            }`}</Text>
          </View>
        ) : null}
        {prepData ? (
          <View style={styles.reporttatContainer}>
            <InfoIconRed />
            <Text style={styles.reportTextStyle}>{prepData}</Text>
          </View>
        ) : null}
      </View>
    ) : null;
  };

  const renderAdditionalInfoView = () => {
    let isPresent;
    let textToShow;
    if (orderLevelStatus === DIAGNOSTIC_ORDER_STATUS.CANCELLATION_REQUESTED) {
      isPresent = props.isCancelled && props.cancelRequestedReason != '';
      textToShow = props.cancelRequestedReason! || string.diagnostics.cancelRequestedText;
    } else {
      isPresent =
        (!!props.additonalRejectedInfo && props.additonalRejectedInfo?.length > 0) ||
        (props.isCancelled && props.cancelledReason != null);
      const consRejectedString = isPresent && props.additonalRejectedInfo?.join(', ');
      textToShow =
        props.isCancelled && props.cancelledReason != null
          ? `${string.diagnostics.orderCancelledReasonText} ${
              !!props.cancelledReason?.comments && props.cancelledReason?.comments != ''
                ? props.cancelledReason?.comments
                : props.cancelledReason.cancellationReason ===
                  'DIAGNOSTIC_STATUS_UPDATED_FROM_ITDOSE'
                ? string.diagnostics.itDoseCancelledText
                : props.cancelledReason?.cancellationReason
            }`
          : `Sample for ${consRejectedString} ${
              props.additonalRejectedInfo?.length > 1 ? 'are' : 'is'
            } rejected`;
    }

    return (
      <>
        {isPresent ? (
          <View style={styles.preparationViewContainer}>
            <Text style={styles.preparationText}>{textToShow}</Text>
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
      key={props?.orderId}
    >
      {!props.isHelp ? showRatingView() : null}
      <View key={props?.orderId} style={{ padding: 16, paddingBottom: 12 }}>
        {renderTopView()}
        {renderMidView()}
        {!!ordersData && !!filterOrderLineItem && filterOrderLineItem?.length
          ? renderTestListView()
          : null}
        {!!ordersData &&
        !!filterOrderLineItem &&
        filterOrderLineItem?.length &&
        DIAGNOSTIC_ORDER_FOR_PREPDATA.includes(props.orderLevelStatus)
          ? renderPreparationData()
          : null}
        {!!props.orderLevelStatus && DIAGNOSTIC_ORDER_FAILED_STATUS.includes(props.orderLevelStatus)
          ? null
          : renderBottomView()}
        {renderCTAsView()}
      </View>
      {props.showAdditonalView || props.isCancelled ? renderAdditionalInfoView() : null}

      {showDetailOTPContainer()}
      {showReportTat()}
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
    alignSelf: 'flex-start',
    marginTop: 4,
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
    marginBottom: '1%',
    minHeight: 40,
  },
  testForText: {
    ...theme.viewStyles.text('SB', isSmallDevice ? 12 : 13, colors.SHERPA_BLUE, 1, 18),
    letterSpacing: 0.3,
  },
  yellowText: { ...theme.viewStyles.yellowTextStyle, fontSize: screenWidth > 380 ? 12 : 11 },
  listViewContainer: {
    backgroundColor: theme.colors.BGK_GRAY,
    borderRadius: 5,
    flex: 1,
    padding: 10,
  },
  rowStyle: { flexDirection: 'row' },
  preparationViewContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
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
  ratingContainer: {
    backgroundColor: theme.colors.TEST_CARD_BUTTOM_BG,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRadius: 10,
    padding: 10,
  },
  reporttatContainer: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startContainer: {
    flexDirection: 'row',
    margin: 5,
  },
  ratingContainerN: {
    backgroundColor: '#F0FFFD',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporttatContainerN: {
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  startContainerN: {
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  ratingTextStyleN: {
    ...theme.viewStyles.text('SB', 14, colors.SHERPA_BLUE, 1, 16),
  },
  reportTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 1, 16),
  },
  ratingTextStyle: {
    ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 1, 16),
  },
  addTestTouch: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientNameView: {
    maxWidth: screenWidth * 0.45,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  newItemView: {
    backgroundColor: '#4CAF50',
    height: 18,
    width: 40,
    borderRadius: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
  },
  newText: {
    ...theme.viewStyles.text('SB', 10, 'white'),
    textAlign: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  editIconView: {
    justifyContent: 'center',
    marginHorizontal: 3,
    marginRight: 6,
  },
  editIconTouch: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: { height: 16, width: 16, resizeMode: 'contain' },
});
