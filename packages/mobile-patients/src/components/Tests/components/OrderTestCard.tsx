import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { isSmallDevice, nameFormater } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  DIAGNOSTIC_ORDER_STATUS,
  REFUND_STATUSES,
} from '@aph/mobile-patients/src/graphql/types/globalTypes';
import moment from 'moment';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { StatusCard } from './StatusCard';
import { getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOrdersList';
import { InfoIconRed } from '../../ui/Icons';
import { convertNumberToDecimal } from '@aph/mobile-patients/src/utils/commonUtils';

const screenHeight = Dimensions.get('window').height;
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
  showRescheduleCancel?: boolean;
  onPressReschedule: () => void;
  onPressViewDetails: () => void;
  onPressAddTest?: () => void;
}

export const OrderTestCard: React.FC<OrderTestCardProps> = (props) => {
  const [moreTests, setMoreTests] = useState<boolean>(false);

  const bookedOn = moment(props?.createdOn)?.format('Do MMM') || null;
  const renderTopView = () => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ flex: 0.8 }}>
          {!!props.orderId && (
            <Text style={{ ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18) }}>
              Order ID #{props.orderId}
            </Text>
          )}
          {!!bookedOn && (
            <Text style={{ ...theme.viewStyles.text('R', 10, colors.SHERPA_BLUE, 0.5, 14) }}>
              Booked on {bookedOn}
            </Text>
          )}
        </View>
        {!!props?.orderLevelStatus && <StatusCard titleText={props?.orderLevelStatus!} />}
      </View>
    );
  };

  const renderMidView = () => {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          marginTop: 20,
          marginBottom: '2%',
        }}
      >
        {!!props.patientName && (
          <View>
            <Text
              style={{
                ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18),
                letterSpacing: 0.3,
              }}
            >
              Tests for {props.gender} {props.patientName}
            </Text>
          </View>
        )}
        {props.showAddTest ? (
          <TouchableOpacity activeOpacity={1} onPress={props.onPressAddTest}>
            <Text
              style={{ ...theme.viewStyles.yellowTextStyle, fontSize: screenWidth > 380 ? 13 : 12 }}
            >
              ADD TEST
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  const renderTestListView = () => {
    return (
      <View style={{ backgroundColor: '#F9F9F9', borderRadius: 5, flex: 1, padding: 10 }}>
        {renderTestNames()}
      </View>
    );
  };

  const renderTestNames = () => {
    return (
      <>
        {props.ordersData?.map(
          (
            item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems,
            index: number
          ) => (
            <View style={{ flexDirection: 'row' }}>
              {index < 2 && !moreTests ? (
                <>
                  <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                  <Text style={styles.testName}>
                    {!!item?.itemName ? nameFormater(item?.itemName!, 'title') : ''}{' '}
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
              item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems,
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

  const renderPreparationData = () => {
    return (
      <>
        {props.ordersData?.map(
          (
            item: getDiagnosticOrdersList_getDiagnosticOrdersList_ordersList_diagnosticOrderLineItems
          ) => {
            return (
              <>
                {(item?.itemObj
                  ? item?.itemObj?.testPreparationData != ''
                  : item?.diagnostics?.testPreparationData != '') && (
                  <View
                    style={{
                      flexDirection: 'row',
                      backgroundColor: '#FCFDDA',
                      flex: 1,
                      padding: 10,
                    }}
                  >
                    <InfoIconRed style={styles.infoIconStyle} />
                    <Text
                      style={[
                        {
                          ...theme.fonts.IBMPlexSansMedium(10),
                          lineHeight: 18,
                          letterSpacing: 0.1,
                          color: theme.colors.SHERPA_BLUE,
                          opacity: 0.7,
                          marginHorizontal: '2%',
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
        )}
      </>
    );
  };

  const renderBottomView = () => {
    const bookedForDate = !!props.dateTime
      ? moment(props.dateTime)?.format('ddd, DD MMM YYYY') || null
      : null;
    const bookedForTime = moment(props.slotTime).format('hh:mm a');

    return (
      <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginTop: '6%' }}>
        {(!!bookedForTime || !!bookedForDate) && (
          <View>
            <Text style={styles.headingText}>Test Slot</Text>
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
        style={{
          marginVertical: '3%',
          flexDirection: 'row',
          justifyContent: props.showRescheduleCancel ? 'space-between' : 'flex-end',
        }}
      >
        {!!props.showRescheduleCancel && props.showRescheduleCancel ? (
          <TouchableOpacity activeOpacity={1} onPress={props.onPressReschedule}>
            <Text
              style={{
                ...theme.viewStyles.yellowTextStyle,
                fontSize: screenWidth > 380 ? 14 : 13,
                lineHeight: 20,
              }}
            >
              RESCHEDULE
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity activeOpacity={1} onPress={props.onPressViewDetails}>
          <Text
            style={{
              ...theme.viewStyles.yellowTextStyle,
              fontSize: screenWidth > 380 ? 14 : 13,
              lineHeight: 20,
            }}
          >
            VIEW DETAILS
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => console.log('card pressed')}
      style={[styles.containerStyle, props.style]}
    >
      <View key={props?.key?.toString()}>
        {renderTopView()}
        {renderMidView()}
        {!!props.ordersData && props.ordersData?.length > 0 ? renderTestListView() : null}
        {!!props.ordersData && props.ordersData?.length > 0 ? renderPreparationData() : null}
        {renderBottomView()}
        {renderCTAsView()}
        {/* {renderAdditionalInfoView()} */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    ...theme.viewStyles.cardViewStyle,
    padding: 16,
    paddingBottom: 12,
    margin: 16,
  },
  titleStyle: {
    color: theme.colors.SHERPA_BLUE,
    ...theme.fonts.IBMPlexSansMedium(17),
    paddingHorizontal: 16,
  },
  bulletStyle: {
    color: '#007C9D',
    fontSize: 4,
    textAlign: 'center',
    paddingTop: 5,
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
    ...theme.viewStyles.text('M', 13, colors.SHERPA_BLUE, 1, 18),
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
});
