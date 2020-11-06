import {
  OrderPlacedIcon,
  PendingIcon,
  TestsIcon,
  Up,
  Down,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { DIAGNOSTIC_ORDER_STATUS } from '@aph/mobile-patients/src/graphql/types/globalTypes';
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
} from 'react-native';
import { getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';

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
    justifyContent: 'space-evenly',
  },
  rightButtonText: {
    ...theme.viewStyles.yellowTextStyle,
  },
  separatorLine: {
    borderLeftWidth: 1,
    backgroundColor: theme.colors.LIGHT_BLUE,
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
});

type OrderStatusType = DIAGNOSTIC_ORDER_STATUS;

export interface TestOrderCardProps {
  key?: string;
  orderId: string;
  showStatus: boolean;
  patientName: string;
  isComingFrom: 'individualTest' | 'individualOrders';
  showDateTime: boolean;
  showRescheduleCancel: boolean;
  isTypeOfPackage?: boolean;
  ordersData: [];
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
  // isReschedule?: boolean;
}

//check if reports are clickable or nit...

export const TestOrderCard: React.FC<TestOrderCardProps> = (props) => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const isOrderWithProgressIcons =
    props.status == DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED ||
    props.status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED ||
    props.status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED ||
    props.status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB ||
    props.status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECIEVED_IN_LAB ||
    props.status == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED;

  const getProgressWidth = (
    status: TestOrderCardProps['status'],
    progresDirection: 'left' | 'right'
  ) => {
    if (progresDirection == 'left') {
      if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED) {
        return 0; //0
      } else if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED) {
        return 2;
      } else if (status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED) {
        return 3; //4
      } else if (
        status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB ||
        status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECIEVED_IN_LAB
      ) {
        return 4;
      } else {
        return 5;
      }
    } else {
      if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED) {
        return 5; //3
      } else if (status == DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED) {
        return 4;
      } else if (status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED) {
        return 3;
      } else if (
        status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB ||
        status == DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECIEVED_IN_LAB
      ) {
        return 2;
      } else {
        return 0;
      }
    }
  };

  const renderGraphicalStatus = () => {
    // if (props.status == DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED) {
    //   //Change once we get all the status list from API
    //   return <View style={styles.progressLineDone} />;
    // }

    if (isOrderWithProgressIcons) {
      return (
        <View style={{ marginLeft: -20 }}>
          <View style={styles.progressLineContainer}>
            <View
              style={[styles.progressLineBefore, { flex: getProgressWidth(props.status, 'left') }]}
            />
            <OrderPlacedIcon style={styles.statusIconStyle} />
            <View
              style={[styles.progressLineAfter, { flex: getProgressWidth(props.status, 'right') }]}
            />
          </View>
          <Text
            style={[
              {
                ...theme.fonts.IBMPlexSansMedium(12),
                lineHeight: 24,
                color: theme.colors.SHERPA_BLUE,
                textTransform: 'capitalize',
              },
              getTextAlign(props.status),
            ]}
          >
            {props.statusText}
          </Text>
        </View>
      );
    }
    return <View style={styles.separator} />;
  };

  const getTextAlign = (status: TestOrderCardProps['status']) => {
    let textAlign = 'left';
    let marginLeft = '1%';
    switch (status) {
      case DIAGNOSTIC_ORDER_STATUS.PICKUP_REQUESTED:
        return {
          textAlign: 'left',
          marginLeft: 0,
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.PICKUP_CONFIRMED:
        return {
          textAlign: 'left',
          marginLeft: '20%',
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_COLLECTED:
        return {
          textAlign: 'center',
          marginLeft: 0,
        };
        break;
      case DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECEIVED_IN_LAB ||
        DIAGNOSTIC_ORDER_STATUS.SAMPLE_RECIEVED_IN_LAB:
        return {
          textAlign: 'center',
          marginLeft: '20%',
        };
      case DIAGNOSTIC_ORDER_STATUS.REPORT_GENERATED:
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
              props.status == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
                ? { color: theme.colors.INPUT_FAILURE_TEXT }
                : {},
            ]}
          >
            {props.statusDesc.replace('_', ' ')}
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
    return (
      <View style={styles.testOptionsOuterView}>
        <View style={{ flex: props.isComingFrom == 'individualTest' ? 1 : 0.6 }}>
          <View
            style={{
              alignItems: props.isComingFrom == 'individualTest' ? 'flex-end' : 'flex-start',
            }}
          >
            <Text
              style={{
                ...theme.viewStyles.yellowTextStyle,
              }}
              onPress={props.onOptionPress}
            >
              {props.isComingFrom == 'individualTest' ? 'ORDER STATUS' : 'VIEW DETAILS'}
            </Text>
          </View>
        </View>
        {/** right view options */}
        {props.showViewReport ? (
          <View style={{ flex: 0.4 }}>
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
              <View style={styles.rightButtonOuterView}>
                <TouchableOpacity activeOpacity={1} onPress={props.onPressCancel}>
                  <View style={{ flex: 0.4 }}>
                    <Text style={styles.rightButtonText}>CANCEL</Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.separatorLine}></View>
                <TouchableOpacity activeOpacity={1} onPress={props.onPressReschedule}>
                  <View style={{ flex: 0.5 }}>
                    <Text style={styles.rightButtonText}>RESCHEDULE</Text>
                  </View>
                </TouchableOpacity>
              </View>
            ) : null}
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
              item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems
            ) => {
              return (
                <>
                  {item?.diagnostics?.testPreparationData != '' && (
                    <View style={styles.testNameView}>
                      <Text style={styles.testNameText}>{item?.diagnostics?.itemName!}:</Text>
                      <Text
                        style={[
                          styles.testNameText,
                          {
                            ...theme.fonts.IBMPlexSansRegular(10.5),
                            marginTop: -7,
                          },
                        ]}
                      >
                        {item?.diagnostics?.testPreparationData!}
                      </Text>
                    </View>
                  )}
                </>
              );
            }
          )
        ) : (
          <View style={styles.testNameView}>
            <Text style={styles.testNameText}>{props.ordersData.itemName!}:</Text>
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
    const testsPerOrder = props.isComingFrom == 'individualTest' ? 0 : props.ordersData.length;
    return (
      <View style={{ marginTop: '5%' }}>
        {props.isComingFrom != 'individualTest' ? (
          props.ordersData.map(
            (
              item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems,
              index
            ) => {
              return (
                <View style={{}}>
                  {index < 3 && (
                    <Text style={[styles.titleStyle]}>
                      {item?.diagnostics?.itemName!.toLowerCase() || ''}
                      {item?.diagnostics?.itemType == 'PACKAGE' &&
                        item?.diagnostics?.PackageInclussion?.length > 0 && (
                          <Text
                            style={[styles.titleStyle, { ...theme.fonts.IBMPlexSansMedium(11) }]}
                          >
                            {'\n'} Inclusions : {item?.diagnostics?.PackageInclussion?.length}
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
      style={[
        styles.containerStyle,
        props.style,
        props.status == DIAGNOSTIC_ORDER_STATUS.ORDER_FAILED
          ? { backgroundColor: theme.colors.DEFAULT_BACKGROUND_COLOR }
          : {},
      ]}
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
