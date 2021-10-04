import React, { useCallback } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders } from '@aph/mobile-patients/src/graphql/types/getDiagnosticOpenOrdersList';
import moment from 'moment';
import { HomePageOrderStatusCard } from '@aph/mobile-patients/src/components/Tests/components/HomePageOrderStatusCard';

const winWidth = Dimensions.get('window').width;

const orderStatus_scrollX = new Animated.Value(0);
let orderStatus_position = Animated.divide(orderStatus_scrollX, winWidth);

export interface OrderCardCarousel {
  data: any;
  onPressBookNow: (
    item: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders
  ) => void;
}

export const OrderCardCarousel: React.FC<OrderCardCarousel> = (props) => {
  const { data } = props;

  const orderStatusCardKeyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderOrderStatusCardItems = ({
    item,
    index,
  }: {
    item: getDiagnosticOpenOrdersList_getDiagnosticOpenOrdersList_openOrders;
    index: number;
  }) => {
    const appointmentTime = moment(item?.slotDateTimeInUTC)?.format('DD MMM, hh:mm a');
    const testPrepData = item?.diagnosticOrderLineItems?.filter(
      (item) => !!item?.itemObj?.preTestingRequirement && item?.itemObj?.preTestingRequirement != ''
    );
    const filterTestPrepData = testPrepData?.length
      ? testPrepData?.map((item) => item?.itemObj?.preTestingRequirement)
      : [];

    const testPrepDataToShow = filterTestPrepData?.length ? filterTestPrepData : null;
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[{ width: winWidth }]}>
        <HomePageOrderStatusCard
          orderId={item?.displayId}
          status={item?.orderStatus}
          reportTat={
            item?.attributesObj?.reportTATMessage! || item?.attributesObj?.reportGenerationTime!
          }
          patientName={`${item?.patientObj?.firstName} ${item?.patientObj?.lastName}`}
          appointmentTime={appointmentTime}
          key={item?.id}
          onPressBookNow={() => props.onPressBookNow(item)}
          testPreparationData={testPrepDataToShow}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        bounces={false}
        keyExtractor={orderStatusCardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        horizontal={true}
        pagingEnabled={true}
        data={data}
        renderItem={renderOrderStatusCardItems}
        maxToRenderPerBatch={3}
        snapToAlignment="center"
        scrollEventThrottle={16}
        decelerationRate={'fast'}
        nestedScrollEnabled={true}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: orderStatus_scrollX } } }])}
      />
      <View style={styles.cardDots}>
        {data?.length > 1
          ? data?.map((_: any, i: any) => {
              let opacity = orderStatus_position.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [0.2, 1, 0.2],
                extrapolate: 'clamp',
              });
              let width = orderStatus_position.interpolate({
                inputRange: [i - 1, i, i + 1],
                outputRange: [8, 14, 8],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.sliderDotStyle,
                    {
                      width,
                      backgroundColor: colors.APP_YELLOW,
                      opacity,
                    },
                  ]}
                />
              );
            })
          : null}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 35,
    alignSelf: 'flex-start',
    left: 32,
  },
  sliderDotStyle: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginTop: 9,
  },
});
