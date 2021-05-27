import React, { useCallback } from 'react';
import { Animated, Dimensions, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import moment from 'moment';
import { PrescriptionCard } from '@aph/mobile-patients/src/components/Tests/components/PrescriptionCard';

const winWidth = Dimensions.get('window').width;

const orderPrescription_scrollX = new Animated.Value(0);
let orderStatus_position = Animated.divide(orderPrescription_scrollX, winWidth);

export interface PrescriptionCardCarouselProps {
  data: any;
  onPressBookNow: (item: any) => void;
  onPressViewPrescription: (item: any) => void;
}

export const PrescriptionCardCarousel: React.FC<PrescriptionCardCarouselProps> = (props) => {
  const { data } = props;

  const keyExtractor = useCallback((item: any, index: number) => `${index}`, []);

  const renderPrescriptionCardItems = ({ item, index }: { item: any; index: number }) => {
    const prescribedText = item?.caseSheet?.diagnosticPrescription;
    const doctorName = item?.doctorName;
    const doctorQualification = item?.doctorCredentials;
    const prescribedDateTime = moment(item?.prescriptionDateTime)?.format('DD MMM, YYYY , hh:mm a');
    const patientName = item?.patientName;
    return (
      <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[{ width: winWidth }]}>
        <PrescriptionCard
          key={index?.toString()}
          heading1={`${prescribedText?.length} Tests Prescribed by`}
          docName={doctorName}
          docQualification={doctorQualification}
          dateTime={`on ${prescribedDateTime}`}
          patientName={`for ${patientName}`}
          buttonTitle={item?.orderCount == 0 ? 'Book Now' : 'Book Again'}
          onPressBookNow={() => props.onPressBookNow(item)}
          onPressViewPrescription={() => props.onPressViewPrescription(item)}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        bounces={false}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        horizontal={true}
        pagingEnabled={true}
        data={data}
        renderItem={renderPrescriptionCardItems}
        maxToRenderPerBatch={3}
        snapToAlignment="center"
        scrollEventThrottle={16}
        decelerationRate={'fast'}
        nestedScrollEnabled={true}
        onScroll={Animated.event([
          { nativeEvent: { contentOffset: { x: orderPrescription_scrollX } } },
        ])}
      />
      <View style={styles.cardDots}>
        {data?.length > 1
          ? data?.map((_, i) => {
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
