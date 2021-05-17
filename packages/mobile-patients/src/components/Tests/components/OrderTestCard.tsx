import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { StatusCard } from '@aph/mobile-patients/src/components/Tests/components/StatusCard';
import { getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import {
  InfoIconRed,
  WhiteProfile,
  OrangeCall,
  LocationOutline,
  StarEmpty,
  ClockIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import { isIphone5s, setBugFenderLog } from '@aph/mobile-patients/src/FunctionHelpers/DeviceHelper';
import { DIAGNOSTIC_ORDER_FAILED_STATUS } from '@aph/mobile-patients/src/strings/AppConfig';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { DiagnosticPhleboCallingClicked, DiagnosticPhleboTrackClicked } from '../Events';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';

const screenWidth = Dimensions.get('window').width;
const SHOW_OTP_ARRAY = [
  DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED,
  DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED,
  DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN,
];

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
  onPressRatingStar: (star: number) => void;
}

export const OrderTestCard: React.FC<OrderTestCardProps> = (props) => {
  const [moreTests, setMoreTests] = useState<boolean>(false);

  const bookedOn = moment(props?.createdOn)?.format('Do MMM') || null;
  const { currentPatient } = useAllCurrentPatients();
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
          <View style={styles.patientNameView}>
            <Text style={styles.testForText}>
              Tests for {props.gender != '' && props.gender} {props.patientName}
            </Text>
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
  const postDiagnosticPhleboCallingClicked = (phleboName: string) => {
    DiagnosticPhleboCallingClicked(currentPatient, props.orderId, phleboName);
  };
  const showDetailOTPContainer = () => {
    const phlObj = props?.phelboObject;
    const otpToShow = !!phlObj && phlObj?.PhelboOTP;
    const phoneNumber = !!phlObj && phlObj?.PhelbotomistMobile;
    const name = !!phlObj && phlObj?.PhelbotomistName;
    const phleboTrackLink = !!phlObj && phlObj?.PhelbotomistTrackLink;
    const checkEta = !!phlObj?.CheckInTime;
    let phleboEta = '';
    if (checkEta) {
      phleboEta = moment(phlObj?.CheckInTime).format('hh:mm A');
    }
    const current = moment();
    const slotime = moment(props.slotTime);
    // calculate total duration
    let duration = moment.duration(slotime.diff(current));
    // duration in hours
    let hours = parseInt(duration.asHours());
    // duration in minutes
    let minutes = parseInt(duration.asMinutes()) % 60;
    const showDetailedinfo = hours == 0 && minutes < 60 && minutes > 0;
    return (
      <>
        {!!otpToShow && SHOW_OTP_ARRAY.includes(props.orderLevelStatus) ? (
          <>
            {showDetailedinfo ? (
              <View style={styles.otpCallContainer}>
                <View style={styles.detailContainer}>
                  {phoneNumber ? (
                    <TouchableOpacity
                      style={styles.callContainer}
                      onPress={() => {
                        postDiagnosticPhleboCallingClicked(name);
                        Linking.openURL(`tel:${phoneNumber}`);
                      }}
                    >
                      <WhiteProfile />
                      <OrangeCall size="sm" style={styles.profileCircle} />
                    </TouchableOpacity>
                  ) : null}
                  {name ? (
                    <View style={styles.nameContainer}>
                      <Text style={styles.nameTextHeadingStyles}>Phlebotomist Details</Text>
                      <Text style={styles.nameTextStyles}>{name}</Text>
                    </View>
                  ) : null}
                </View>
                {otpToShow ? (
                  <View style={styles.otpBoxConatiner}>
                    <Text style={styles.otpBoxTextStyle}>{'OTP'}</Text>
                    <Text style={styles.otpBoxTextStyle}>{otpToShow}</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              showOnlyOTPContainer()
            )}

            {checkEta && props.orderLevelStatus == DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN ? (
              <View style={styles.otpContainer}>
                <View style={styles.etaContainer}>
                  <LocationOutline style={styles.locationIcon} />
                  <Text style={styles.otpTextStyle}>Phlebo will arrive by {phleboEta}</Text>
                </View>
                {phleboTrackLink ? (
                  <TouchableOpacity
                    onPress={() => {
                      try {
                        Linking.canOpenURL(phleboTrackLink).then((supported) => {
                          if (supported) {
                            Linking.openURL(phleboTrackLink);
                          } else {
                            setBugFenderLog('FAILED_OPEN_URL', phleboTrackLink);
                          }
                        });
                      } catch (e) {
                        setBugFenderLog('FAILED_OPEN_URL', phleboTrackLink);
                      }
                    }}
                  >
                    <Text style={styles.trackStyle}>{nameFormater('track Phlebo', 'upper')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}
      </>
    );
  };
  const showOnlyOTPContainer = () => {
    const phlObj = props?.phelboObject;
    const otpToShow = !!phlObj && phlObj?.PhelboOTP;
    return (
      <View style={styles.ratingContainer}>
        <Text style={styles.otpBoxTextStyle}>OTP : {otpToShow}</Text>
      </View>
    );
  };

  const showRatingView = () => {
    const starCount = [1, 2, 3, 4, 5];
    const phlObj = props?.phelboObject;
    const phleboRating = !!phlObj && phlObj?.PhleboRating;
    let checkRating = starCount.includes(phleboRating);
    return props.orderLevelStatus == DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED && !checkRating ? (
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingTextStyle}>How was your Experience with Phlebo</Text>
        <View style={styles.startContainer}>
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
    ) : null;
  };

  const showReportTat = () => {
    const report = !!props?.ordersData?.testPreparationData
      ? props?.ordersData?.testPreparationData
      : '';
    return props.orderLevelStatus == DIAGNOSTIC_ORDER_STATUS.SAMPLE_SUBMITTED && report ? (
      <View style={styles.ratingContainer}>
        <View style={styles.reporttatContainer}>
          <ClockIcon />
          <Text style={styles.reportTextStyle}>{report}</Text>
        </View>
      </View>
    ) : null;
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
      {showDetailOTPContainer()}
      {showRatingView()}
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
    minHeight: 30,
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
    alignSelf: 'center',
    paddingHorizontal: 10,
    color: theme.colors.LIGHT_BLUE,
    ...theme.fonts.IBMPlexSansRegular(10),
  },
  otpContainer: {
    backgroundColor: '#FCFDDA',
    justifyContent: 'space-between',
    flexDirection: 'row',
    height: 40,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRadius: 10,
    padding: 10,
  },
  locationIcon: {
    width: 15,
    height: 15,
    alignSelf: 'center',
  },
  otpCallContainer: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderColor: '#000000',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderRadius: 10,
    padding: 10,
  },
  detailContainer: {
    flexDirection: 'row',
    width: '80%',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  profileCircle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  callContainer: {
    margin: 0,
  },
  nameContainer: {
    justifyContent: 'flex-start',
    alignContent: 'center',
    padding: 10,
    width: '80%',
  },
  nameTextHeadingStyles: {
    ...theme.viewStyles.text('SB', 13, colors.SHERPA_BLUE, 1, 18),
  },
  nameTextStyles: {
    ...theme.viewStyles.text('R', 13, colors.SHERPA_BLUE, 1, 18),
  },
  otpBoxConatiner: {
    width: 45,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  otpBoxTextStyle: {
    ...theme.viewStyles.text('SB', 13, colors.SHERPA_BLUE, 1, 18),
  },
  etaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackStyle: {
    ...theme.viewStyles.text('SB', 13, colors.APP_YELLOW, 1, 18),
  },
  ratingContainer: {
    backgroundColor: '#FCFDDA',
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
  reportTextStyle: {
    marginHorizontal: 10,
    ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 1, 16),
  },
  ratingTextStyle: {
    ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 1, 16),
  },
  patientNameView: { width: '67%', justifyContent: 'center' },
});
