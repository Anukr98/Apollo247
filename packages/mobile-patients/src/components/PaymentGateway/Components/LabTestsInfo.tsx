import React, { useState } from 'react';
import { StyleSheet, Dimensions, Text, View, TouchableOpacity } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import moment from 'moment';
import { TimeIcon } from '@aph/mobile-patients/src/components/ui/Icons';
import {
  nameFormater,
  isSmallDevice,
  extractPatientDetails,
} from '@aph/mobile-patients/src//helpers/helperFunctions';
import { Spearator } from '@aph/mobile-patients/src/components/ui/BasicComponents';

const width = Dimensions.get('window').width;

export interface LabTestsInfoProps {
  orderInfo: any;
  modifiedOrderId: any;
  modifiedOrders: any;
  isModify: boolean;
}

export const LabTestsInfo: React.FC<LabTestsInfoProps> = (props) => {
  const { orderInfo, modifiedOrderId, modifiedOrders, isModify } = props;
  const { ordersList } = orderInfo;
  const slotTime = isModify
    ? modifiedOrders?.[0]?.slotDateTimeInUTC
    : orderInfo?.ordersList?.[0]?.slotDateTimeInUTC;
  const slotDuration = isModify
    ? modifiedOrders?.[0]?.attributesObj?.slotDurationInMinutes
    : orderInfo?.ordersList?.[0]?.attributesObj?.slotDurationInMinutes || 0;
  const [showMoreArray, setShowMoreArray] = useState([] as any);

  function _onPressMore(item: any) {
    const displayId = item?.displayId;
    const array = showMoreArray?.concat(displayId);
    setShowMoreArray(array);
  }

  function _onPressLess(item: any) {
    const displayId = item?.displayId;
    const removeItem = showMoreArray?.filter((id: number) => id !== displayId);
    setShowMoreArray(removeItem);
  }

  const renderSlotTime = () => {
    const date = slotTime != '' && moment(slotTime)?.format('DD MMM');
    const year = slotTime != '' && moment(slotTime)?.format('YYYY');
    const time = slotTime != '' && moment(slotTime)?.format('hh:mm A');
    const rangeAddedTime =
      slotTime != '' &&
      moment(slotTime)
        ?.add(slotDuration, 'minutes')
        ?.format('hh:mm A');
    return (
      <View style={styles.pickupView}>
        <TimeIcon style={styles.timeIconStyle} />
        <Text style={styles.pickupText}>
          Pickup Time :{' '}
          {!!date && !!year && (
            <Text style={styles.pickupDate}>
              {date}, {year}{' '}
            </Text>
          )}
          {!!time && (
            <Text style={styles.pickupDate}>
              | {time} - {rangeAddedTime}
            </Text>
          )}
        </Text>
      </View>
    );
  };

  const test = (order: any) => {
    const displayId = order?.displayId;
    const lineItemsLength = order?.diagnosticOrderLineItems?.length;
    const lineItems = order?.diagnosticOrderLineItems;
    const remainingItems = !!lineItemsLength && lineItemsLength - 1;
    const { patientName, patientSalutation } = extractPatientDetails(order?.patientObj);
    const isNewlyModified =
      lineItemsLength?.length > 0 && lineItems?.[0]?.editOrderID === modifiedOrderId;
    return (
      <>
        <Spearator style={styles.separator} />
        <View style={styles.outerView}>
          <View style={styles.patientsView}>
            <Text style={styles.patientName}>
              Tests for {nameFormater(`${patientSalutation} ${patientName}`, 'title')}
            </Text>

            {!!displayId && <Text style={styles.pickupDate}>#{displayId}</Text>}
          </View>
          {!!lineItemsLength &&
            lineItemsLength > 0 &&
            (showMoreArray?.includes(displayId) ? null : (
              <View style={styles.itemsView}>
                <View
                  style={{
                    ...styles.subCont,
                    maxWidth: !!isNewlyModified ? (width > 350 ? '68%' : '57%') : '75%',
                  }}
                >
                  <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
                  <Text style={[styles.testName]}>
                    {nameFormater(lineItems?.[0]?.itemName, 'title')}
                  </Text>
                  {!!isNewlyModified ? renderNewTag() : null}
                  {remainingItems > 0 && (
                    <TouchableOpacity onPress={() => _onPressMore(order)} style={{ marginLeft: 2 }}>
                      <Text style={styles.moreText}>+ {remainingItems} MORE</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          {showMoreArray?.includes(displayId) && renderMore(order, lineItems)}
        </View>
      </>
    );
  };

  const renderMore = (item: any, lineItems: any) => {
    return (
      <View style={styles.itemsView}>
        {lineItems?.map((items: any, index: number) => {
          const isNewlyModified = items?.editOrderID === modifiedOrderId;
          return (
            <View style={{ ...styles.subCont, maxWidth: !!isNewlyModified ? '72%' : '75%' }}>
              <Text style={styles.bulletStyle}>{'\u2B24'}</Text>
              <Text style={[styles.testName]}>{nameFormater(items?.itemName, 'default')}</Text>
              {!!isNewlyModified ? renderNewTag() : null}
              {lineItems?.length - 1 == index && (
                <TouchableOpacity onPress={() => _onPressLess(item)} style={{ marginLeft: 2 }}>
                  <Text style={styles.moreText}> LESS</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderNewTag = () => {
    return (
      <View style={styles.newItemView}>
        <Text style={styles.newText}>NEW</Text>
      </View>
    );
  };

  const renderTests = () => {
    const list = isModify && modifiedOrders?.length ? modifiedOrders : ordersList;
    return (
      <View>
        {list?.map((order: any) => {
          return test(order);
        })}
      </View>
    );
  };

  const renderCard = () => {
    return (
      <View style={{}}>
        {renderSlotTime()}
        {renderTests()}
      </View>
    );
  };

  return <View style={styles.container}>{renderCard()}</View>;
};
const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: '#D4D4D4',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  subCont: {
    flexDirection: 'row',
    flex: 1,
  },
  pickupView: {
    flexDirection: 'row',
    backgroundColor: '#F3FFFF',
    paddingVertical: 17,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  timeIconStyle: {
    height: 20,
    width: 20,
    resizeMode: 'contain',
    marginRight: 5,
  },
  pickupText: {
    ...theme.fonts.IBMPlexSansSemiBold(14),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  pickupDate: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 18,
    color: theme.colors.SHERPA_BLUE,
  },
  outerView: {
    backgroundColor: theme.colors.WHITE,
    padding: 10,
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
  patientName: {
    width: '60%',
    ...theme.fonts.IBMPlexSansSemiBold(12),
    lineHeight: 20,
    color: theme.colors.SHERPA_BLUE,
  },
  patientsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 6,
    marginRight: 6,
  },
  itemsView: {
    backgroundColor: theme.colors.BGK_GRAY,
    margin: 8,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.BGK_GRAY,
  },
  moreText: {
    ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW, 1, 18),
  },
  separator: {
    borderColor: 'rgba(2,71,91,0.4)',
    borderBottomWidth: 1,
    height: 1,
  },
});
