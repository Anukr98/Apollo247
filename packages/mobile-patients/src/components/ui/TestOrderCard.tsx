import {
  OrderPlacedIcon,
  PendingIcon,
  TestsIcon,
  Up,
  Down,
} from '@aph/mobile-patients/src/components/ui/Icons';
import {
  DIAGNOSTIC_ORDER_STATUS,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import React, { useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TouchableOpacityProps,
  Dimensions,
} from 'react-native';
import { getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersListByMobile';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';
import { DisclaimerSection } from '@aph/mobile-patients/src/components/Tests/components/DisclaimerSection';
import string from '@aph/mobile-patients/src/strings/strings.json';
import {
  getTestOrderStatusText,
  nameFormater,
} from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DIAGNOSTIC_ORDER_FAILED_STATUS,
  DIAGNOSTIC_JUSPAY_REFUND_STATUS,
  DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS,
  DIAGNOSTIC_HORIZONTAL_STATUS_TO_SHOW,
  DIAGNOSTIC_COMPLETED_STATUS,
  DIAGNOSTIC_CONFIRMED_STATUS,
  DIAGNOSTIC_COLLECTION_STATUS,
  DIAGNOSTIC_LAB_COLLECTION_STATUS,
  DIAGNOSTIC_LAB_TESTING_STATUS,
} from '@aph/mobile-patients/src/strings/AppConfig';
const width = Dimensions.get('window').width;

type OrderStatusType = DIAGNOSTIC_ORDER_STATUS | REFUND_STATUSES;
export interface TestOrderCardProps {
  key?: string;
  orderId: string;
  showStatus: boolean;
  patientName: string;
  isComingFrom: 'individualTest' | 'individualOrders';
  showDateTime: boolean;
  showRescheduleCancel: boolean;
  isTypeOfPackage?: boolean;
  ordersData: any;
  dateTime: string;
  statusDesc?: string;
  isCancelled: boolean;
  showViewReport?: boolean;
  onPress: () => void;
  status?: OrderStatusType;
  statusText?: string | '';
  style?: StyleProp<ViewStyle>;
  onPressCancel?: TouchableOpacityProps['onPress'];
  onPressReschedule?: () => void;
  showTestPreparation: boolean;
  onOptionPress: () => void;
  onPressViewReport?: () => void;
  showRefund?: boolean;
  refundStatus?: REFUND_STATUSES;
}

const statusToBeShown = DIAGNOSTIC_HORIZONTAL_STATUS_TO_SHOW;

const COMPLETED_STATUS = DIAGNOSTIC_COMPLETED_STATUS;

const CONFIRMED_STATUS = (DIAGNOSTIC_CONFIRMED_STATUS as any) as OrderStatusType;

const COLLECTION_STATUS = (DIAGNOSTIC_COLLECTION_STATUS as any) as OrderStatusType;

const LAB_COLLECTION_STATUS = (DIAGNOSTIC_LAB_COLLECTION_STATUS as any) as OrderStatusType;

//no need to show in ui.
const LAB_TESTING_STATUS = (DIAGNOSTIC_LAB_TESTING_STATUS as any) as OrderStatusType;

export const TestOrderCard: React.FC<TestOrderCardProps> = (props) => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(false);
  const isOrderWithProgressIcons =
    statusToBeShown.includes(props.status!) ||
    (props.showRefund && DIAGNOSTIC_JUSPAY_REFUND_STATUS.includes(props.refundStatus!));

  const getProgressWidth = (status: OrderStatusType, progresDirection: 'left' | 'right') => {
    //reports_generated & sample_rejected_in_lab are complete status (not added here)
    if (progresDirection == 'left') {
      if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED) {
        return 0; //0
      } else if (CONFIRMED_STATUS.includes(status)) {
        return 1.5; //2
      } else if (COLLECTION_STATUS.includes(status)) {
        return 2; //4
      } else if (LAB_COLLECTION_STATUS.includes(status) || LAB_TESTING_STATUS.includes(status)) {
        return 3;
      } else if (
        status == REFUND_STATUSES.PENDING ||
        ((DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS as any) as OrderStatusType).includes(status)
      ) {
        return 2;
      } else if (status == REFUND_STATUSES.SUCCESS) {
        return 4;
      } else {
        return 5;
      }
    } else {
      if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED) {
        return 5;
      } else if (CONFIRMED_STATUS.includes(status)) {
        return 4.5; //4
      } else if (COLLECTION_STATUS.includes(status)) {
        return 4;
      } else if (LAB_COLLECTION_STATUS.includes(status) || LAB_TESTING_STATUS.includes(status)) {
        return 2;
      } else if (
        status == REFUND_STATUSES.PENDING ||
        ((DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS as any) as OrderStatusType).includes(status)
      ) {
        return 2;
      } else if (status == REFUND_STATUSES.SUCCESS) {
        return 0;
      } else {
        return 0;
      }
    }
  };

  const renderGraphicalStatus = () => {
    const isFinalStatus = COMPLETED_STATUS.includes(props.status!);
    // if (props.status == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED) {
    //   //Change once we get all the status list from API
    //   return <View style={styles.progressLineDone} />;
    // }
    const statusToCheck = props.showRefund ? props.refundStatus! : props.status!;
    const statusTextToShow = props.showRefund ? props.refundStatus! : props.statusText!;
    if (isOrderWithProgressIcons) {
      return (
        <View style={{ marginLeft: -20 }}>
          <View style={styles.progressLineContainer}>
            <View
              style={[
                isFinalStatus ? styles.progressLineDone : styles.progressLineBefore,
                { flex: getProgressWidth(statusToCheck!, 'left') },
              ]}
            />
            <OrderPlacedIcon style={styles.statusIconStyle} />
            <View
              style={[
                isFinalStatus ? styles.progressLineDone : styles.progressLineAfter,
                {
                  flex: getProgressWidth(statusToCheck!, 'right'),
                  backgroundColor:
                    statusToCheck == REFUND_STATUSES.PENDING ||
                    ((DIAGNOSTIC_JUSPAY_INVALID_REFUND_STATUS as any) as OrderStatusType).includes(
                      statusToCheck
                    )
                      ? '#EF3A47'
                      : '#00b38e',
                },
              ]}
            />
          </View>
          <Text
            style={[
              {
                ...theme.fonts.IBMPlexSansMedium(12),
                lineHeight: 24,
                color: theme.colors.SHERPA_BLUE,
              },
              getTextAlign(statusToCheck),
            ]}
          >
            {nameFormater(getTestOrderStatusText(statusTextToShow!), 'default')}
          </Text>
        </View>
      );
    } else if (props.isCancelled && !props.showRefund) {
      return (
        <View style={{ marginLeft: -20 }}>
          <View style={styles.progressLineContainer}>
            <View style={[styles.progressLineBefore, { flex: 0 }]} />
            <OrderPlacedIcon
              style={[styles.statusIconStyle, { opacity: 0.6, tintColor: '#c2bcbc' }]}
            />
            <View
              style={[
                styles.progressLineAfter,
                { flex: 5, backgroundColor: '#c2bcbc', opacity: 0.2 },
              ]}
            />
          </View>
          <Text
            style={[
              {
                ...theme.fonts.IBMPlexSansMedium(12),
                lineHeight: 24,
                color: '#c2bcbc',
                opacity: 1,
                textTransform: 'capitalize',
              },
            ]}
          >
            Pickup Requested
          </Text>
        </View>
      );
    }
    return <View style={styles.separator} />;
  };

  const getTextAlign = (status: string) => {
    switch (status) {
      case DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED:
        return {
          textAlign: 'left',
          marginLeft: 0,
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED:
      case DIAGNOSTIC_ORDER_STATUS.PHLEBO_CHECK_IN:
        return {
          textAlign: 'left',
          marginLeft: '20%',
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED:
      case DIAGNOSTIC_ORDER_STATUS.PHLEBO_COMPLETED:
        return {
          textAlign: 'center',
          marginLeft: -10,
        };
        break;
      //for last two, no need to show on ui so taking previous status.
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED_IN_LAB:
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_NOT_COLLECTED_IN_LAB:
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB:
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_TESTED:
        return {
          textAlign: 'center',
          marginLeft: '10%',
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED:
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_REJECTED_IN_LAB:
        return {
          textAlign: 'right',
          marginLeft: 0,
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.PAYMENT_FAILED:
        return {
          textAlign: 'right',
          marginLeft: 0,
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.ORDER_CANCELLED:
        return {
          textAlign: 'right',
          marginLeft: 0,
        };
        break;
      case REFUND_STATUSES.PENDING:
      case REFUND_STATUSES.FAILURE:
      case REFUND_STATUSES.MANUAL_REVIEW:
      case REFUND_STATUSES.REFUND_REQUEST_NOT_SENT:
        return {
          textAlign: 'center',
          marginLeft: 0,
        };
        break;
      case REFUND_STATUSES.SUCCESS:
        return {
          textAlign: 'right',
          marginLeft: 0,
        };
        break;
    }
  };
  const renderStatusAndTime = () => {
    return (
      <View style={{ flex: 1, marginTop: 4 }}>
        <Text numberOfLines={1} style={styles.dateTimeStyle}>
          {props.dateTime}
        </Text>
      </View>
    );
  };

  const mapStatusWithText = (val: string) => {
    return val?.replace(/[_]/g, ' ');
  };

  const renderDescriptionAndId = () => {
    return (
      <View>
        <View style={[styles.viewRowStyle, { justifyContent: 'space-between' }]}>
          <Text
            numberOfLines={1}
            style={[
              styles.statusStyle,
              props.status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED
                ? { ...theme.fonts.IBMPlexSansSemiBold(12) }
                : {},
            ]}
          >
            {props.statusDesc?.replace('_', ' ')}
          </Text>
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(13),
              lineHeight: 16,
              color: theme.colors.CARD_SUBTEXT,
            }}
          >
            #{props.orderId}
          </Text>
        </View>
        {props.patientName! && (
          <Text
            style={{
              ...theme.fonts.IBMPlexSansMedium(12),
              lineHeight: 16,
              color: theme.colors.SHERPA_BLUE,
            }}
          >
            for {props.patientName}
          </Text>
        )}
      </View>
    );
  };

  const renderTestOptions = () => {
    const hideLeftOption = props.isCancelled && props.isComingFrom == 'individualTest';
    return (
      <View
        style={[
          styles.testOptionsOuterView,
          { alignSelf: hideLeftOption ? 'flex-end' : undefined },
        ]}
      >
        {hideLeftOption || props.isComingFrom == 'individualTest' ? null : (
          <View style={{ flex: 0.6 }}>
            <View
              style={{
                alignItems: 'flex-start',
              }}
            >
              <Text style={styles.rightButtonText} onPress={props.onOptionPress}>
                {'ORDER SUMMARY'}
              </Text>
            </View>
          </View>
        )}
        {/** right view options */}

        {props.showViewReport ? (
          //0.4
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text
              style={{
                ...theme.fonts.IBMPlexSansBold(13),
                color:
                  props.status === DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
                    ? theme.colors.APP_YELLOW
                    : '#FED984',
                lineHeight: 24,
              }}
              onPress={
                props.status === DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED
                  ? props.onPressViewReport
                  : {}
              }
            >
              VIEW REPORT
            </Text>
          </View>
        ) : (
          <>
            {props.showRescheduleCancel ? (
              <View
                style={[
                  styles.rightButtonOuterView,
                  {
                    justifyContent:
                      props.status == DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL
                        ? 'flex-end'
                        : 'space-evenly',
                  },
                ]}
              >
                <TouchableOpacity activeOpacity={1} onPress={props.onPressCancel}>
                  <View style={{ flex: 0.4 }}>
                    <Text style={styles.rightButtonText}>CANCEL</Text>
                  </View>
                </TouchableOpacity>
                {props.status == DIAGNOSTIC_ORDER_STATUS.PAYMENT_SUCCESSFUL ? null : (
                  <>
                    <View style={styles.separatorLine}></View>
                    <TouchableOpacity activeOpacity={1} onPress={props.onPressReschedule}>
                      <View style={{ flex: 0.5 }}>
                        <Text style={styles.rightButtonText}>RESCHEDULE</Text>
                      </View>
                    </TouchableOpacity>
                  </>
                )}
                <TouchableOpacity onPress={_changeDisclaimer}>
                  {showDisclaimer ? (
                    <Up style={styles.arrowIconStyle} />
                  ) : (
                    <Down style={styles.arrowIconStyle} />
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {((DIAGNOSTIC_ORDER_FAILED_STATUS as any) as OrderStatusType).includes(
                  props.status!
                ) ? (
                  <View
                    style={{
                      flex: props.isComingFrom == 'individualTest' ? 1 : 0.4,
                      alignItems: 'flex-end',
                    }}
                  >
                    <Text style={styles.failureText}>
                      {nameFormater(mapStatusWithText(props.status!), 'title')}
                    </Text>
                  </View>
                ) : null}
              </>
            )}
          </>
        )}
      </View>
    );
  };

  const renderDetails = () => {
    return (
      <View style={[styles.detailsViewStyle]}>
        {renderDescriptionAndId()}
        {renderTestInOrder()}
        {props.showDateTime ? renderStatusAndTime() : null}
        {props.showStatus ? renderGraphicalStatus() : null}
        {props.showTestPreparation ? renderTestPreparation() : null}
        {showDropDown ? renderPreTestingView() : null}
        {renderTestOptions()}
        {showDisclaimer ? <DisclaimerSection content={string.diagnostics.disclaimerText} /> : null}
      </View>
    );
  };

  const renderPackageNameView = () => {
    return (
      <>
        <View style={styles.packageNameView}>
          <Text style={styles.packageNameText}>{props.ordersData?.packageName!}</Text>
        </View>
        {/**
         * look for small width devices
         */}
        <Spearator style={styles.packageNameSeparator} />
      </>
    );
  };

  /**
   * case not handled if two tests have same pre-requiste
   */
  const renderPreTestingView = () => {
    return (
      <View>
        {props.isComingFrom == 'individualOrders' ? (
          props.ordersData.map(
            (
              item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems
            ) => {
              return (
                <>
                  {(item?.itemObj
                    ? item?.itemObj?.testPreparationData != ''
                    : item?.diagnostics?.testPreparationData != '') && (
                    <View style={[styles.testNameView]}>
                      <Text style={styles.testNameText}>
                        {item?.itemName! || item?.diagnostics?.itemName!}:
                      </Text>
                      <Text
                        style={[
                          styles.testNameText,
                          {
                            ...theme.fonts.IBMPlexSansRegular(10.5),
                            marginTop: -7,
                          },
                        ]}
                      >
                        {item?.itemObj?.testPreparationData! ||
                          item?.diagnostics?.testPreparationData}
                      </Text>
                    </View>
                  )}
                </>
              );
            }
          )
        ) : (
          <View style={styles.testNameView}>
            <Text style={styles.testNameText}>{props.ordersData?.itemName!}:</Text>
            <Text
              style={[
                styles.testNameText,
                {
                  ...theme.fonts.IBMPlexSansRegular(10.5),
                  marginTop: -7,
                },
              ]}
            >
              {props.ordersData?.testPreparationData!}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderTestInOrder = () => {
    const testsPerOrder = props.isComingFrom == 'individualTest' ? 0 : props.ordersData?.length;
    return (
      <View style={{ marginTop: '5%' }}>
        {props.isComingFrom != 'individualTest' ? (
          props.ordersData?.map(
            (
              item: getDiagnosticOrdersListByMobile_getDiagnosticOrdersListByMobile_ordersList_diagnosticOrderLineItems,
              index: any
            ) => {
              return (
                <View style={{}}>
                  {index < 3 && (
                    <Text style={[styles.titleStyle]}>
                      {item?.itemName?.toLowerCase() ||
                        item?.diagnostics?.itemName?.toLowerCase() ||
                        ''}
                      {(item?.itemObj?.itemType! == 'PACKAGE' ||
                        item?.diagnostics?.itemName == 'PACKAGE') &&
                        (item?.itemObj
                          ? item?.itemObj?.inclusions != null &&
                            item?.itemObj?.inclusions?.length! > 0
                          : item?.diagnostics?.inclusions != null &&
                            item?.diagnostics?.inclusions?.length! > 0) && (
                          <Text
                            style={[styles.titleStyle, { ...theme.fonts.IBMPlexSansMedium(11) }]}
                          >
                            {'\n'} Inclusions :{' '}
                            {item?.itemObj?.inclusions?.length ||
                              item?.diagnostics?.inclusions!.length}
                          </Text>
                        )}
                      {index == 2 && testsPerOrder - 3 > 0 ? (
                        <Text style={styles.moreText}>
                          {'     '} + {testsPerOrder - 3} more
                        </Text>
                      ) : null}
                    </Text>
                  )}
                </View>
              );
            }
          )
        ) : (
          <View>
            <Text style={styles.titleStyle}>{props.ordersData?.itemName!}</Text>
          </View>
        )}
      </View>
    );
  };

  const _changeDropDownState = () => {
    setShowDropDown(!showDropDown);
  };

  const _changeDisclaimer = () => {
    setShowDisclaimer(!showDisclaimer);
  };

  const renderTestPreparation = () => {
    return (
      <View style={styles.testPreparationView}>
        <TouchableOpacity onPress={() => _changeDropDownState()} style={{}}>
          <View style={styles.testPreparationInnerView}>
            <PendingIcon style={styles.pendingIconStyle} />
            <Text style={styles.preTestingText}>See Pre-testing Requirements</Text>
            {showDropDown ? (
              <Up style={styles.arrowIconStyle} />
            ) : (
              <Down style={styles.arrowIconStyle} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={props.onPress}
      style={[styles.containerStyle, props.style]}
    >
      {props.isTypeOfPackage ? renderPackageNameView() : null}
      <View style={{ flexDirection: 'row' }}>
        <TestsIcon style={styles.testIconStyle} />
        {renderDetails()}
      </View>
    </TouchableOpacity>
  );
};

TestOrderCard.defaultProps = {
  showStatus: true,
  showDateTime: false,
  showRescheduleCancel: false,
  showTestPreparation: true,
  isTypeOfPackage: false,
};

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    paddingBottom: 12,
  },
  viewRowStyle: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailsViewStyle: {
    flex: 1,
    marginLeft: 16,
  },
  titleStyle: {
    ...theme.fonts.IBMPlexSansMedium(15),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  descriptionStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    letterSpacing: 0.04,
    color: theme.colors.LIGHT_BLUE,
    opacity: 0.6,
    flex: 1,
  },
  idStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    color: theme.colors.SHERPA_BLUE,
    opacity: 0.6,
    flex: 1,
    textAlign: 'right',
  },
  statusStyle: {
    ...theme.fonts.IBMPlexSansMedium(12.5),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.CARD_SUBTEXT,
    textTransform: 'capitalize',
  },
  dateTimeStyle: {
    ...theme.fonts.IBMPlexSansMedium(12.5),
    lineHeight: 20,
    letterSpacing: 0.04,
    color: theme.colors.CARD_SUBTEXT,
    flex: 1,
    textAlign: 'left',
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
    marginTop: 15,
    marginBottom: 8,
  },
  statusIconStyle: {
    height: 28,
    width: 28,
  },
  progressLineContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  progressLineDone: {
    flex: 1,
    height: 4,
    backgroundColor: '#00b38e',
    marginTop: 20,
    marginBottom: 16,
  },
  progressLineBefore: {
    flex: 1,
    height: 4,
    backgroundColor: '#0087ba',
  },
  progressLineAfter: {
    flex: 1,
    height: 4,
    backgroundColor: '#00b38e',
    opacity: 0.2,
  },
  testOptionsOuterView: {
    marginTop: 16,
    marginBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: -32, //align with medicine
  },
  rightButtonOuterView: {
    flex: 0.7,
    flexDirection: 'row',
  },
  rightButtonText: {
    ...theme.viewStyles.yellowTextStyle,
    fontSize: width > 380 ? 13 : 12,
  },
  separatorLine: {
    borderLeftWidth: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
    marginTop: 3,
    marginLeft: 2,
    marginRight: 3,
    marginBottom: 2,
    opacity: 0.2,
  },
  packageNameText: {
    ...theme.fonts.IBMPlexSansSemiBold(16),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    textTransform: 'capitalize',
    marginBottom: 6,
    textAlign: 'left',
  },
  packageNameView: { marginLeft: '10%' },
  packageNameSeparator: { marginLeft: -16, width: '110%', marginBottom: 8, height: 1.5 },
  testNameView: { backgroundColor: '#F7F8F5', flex: 1, paddingTop: 3, paddingLeft: 10 },
  testNameText: {
    ...theme.fonts.IBMPlexSansSemiBold(11),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    textTransform: 'capitalize',
  },
  moreText: {
    ...theme.fonts.IBMPlexSansRegular(12),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
    textTransform: 'none',
    fontWeight: 'normal',
  },
  testPreparationView: { alignSelf: 'flex-end', width: '80%' },
  testPreparationInnerView: { flexDirection: 'row', justifyContent: 'flex-end' },
  pendingIconStyle: { marginTop: '3%', height: 10, width: 10, resizeMode: 'contain' },
  preTestingText: {
    marginHorizontal: 5,
    ...theme.fonts.IBMPlexSansRegular(10),
    lineHeight: 24,
    color: theme.colors.SHERPA_BLUE,
  },
  arrowIconStyle: {
    marginTop: '1%',
    height: 20,
    width: 20,
    resizeMode: 'contain',
    tintColor: '#B3C8CE',
  },
  testIconStyle: { marginTop: '2%', height: 24, width: 24, resizeMode: 'contain' },
  failureText: {
    ...theme.fonts.IBMPlexSansBold(13),
    color: theme.colors.INPUT_FAILURE_TEXT,
    lineHeight: 24,
  },
});
