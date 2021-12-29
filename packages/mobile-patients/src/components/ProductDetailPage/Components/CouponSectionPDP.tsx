import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { SpecialOffers, ArrowRight } from '@aph/mobile-patients/src/components/ui/Icons';
import { SpecialOffersCouponsData } from '@aph/mobile-patients/src/helpers/apiCalls';

export const CouponSectionPDP = (props: { offersData: SpecialOffersCouponsData[] }) => {
  const { offersData } = props;
  const newOffersData = offersData.map((ele: SpecialOffersCouponsData) => ({
    ...ele,
    knowMoreOption: false,
  }));
  const [couponData, setCouponData] = useState(newOffersData);
  const [visibleCoupons, setVisibleCoupons] = useState<number>(
    couponData?.length === 1 ? couponData?.length : 2
  );
  const totalCoupons = couponData.length;
  const remainingCoupons = totalCoupons - visibleCoupons;

  const updateKnowMore = (position: number) => {
    const array = [...couponData];
    array[position].knowMoreOption = !array[position].knowMoreOption;
    setCouponData(array);
  };

  const renderIndividualCoupon = (item: SpecialOffersCouponsData, index: number) => {
    return (
      <View style={styles.itemContainer}>
        <View style={[styles.headingContainer, { justifyContent: 'space-between' }]}>
          <View style={styles.textContainer}>
            {item?.knowMoreOption ? (
              <Text style={styles.highlightedStyle}>
                {item?.couponCode}
                {': '}
                <Text style={styles.textStyle}>{item?.header}</Text>
              </Text>
            ) : (
              <Text numberOfLines={2} ellipsizeMode={'tail'} style={styles.highlightedStyle}>
                {item?.couponCode}
                {': '}
                <Text style={styles.textStyle}>{item?.header}</Text>
              </Text>
            )}
          </View>
          <View style={styles.arrowContainer}>
            <TouchableOpacity onPress={() => updateKnowMore(index)}>
              <ArrowRight
                style={
                  item?.knowMoreOption
                    ? { transform: [{ rotate: '270deg' }] }
                    : { transform: [{ rotate: '90deg' }] }
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        {item?.knowMoreOption && (
          <View style={styles.knowMoreSection}>
            <Text style={styles.descriptionTextStyle}>{item?.description}</Text>
          </View>
        )}
      </View>
    );
  };

  const renderViewAllOffersButton = () => {
    return (
      <View style={styles.offersHeadingContainer}>
        <TouchableOpacity
          onPress={() => {
            visibleCoupons < totalCoupons ? setVisibleCoupons(totalCoupons) : setVisibleCoupons(2);
          }}
        >
          {visibleCoupons < totalCoupons ? (
            remainingCoupons === 1 ? (
              <Text style={styles.textStyle}>See {remainingCoupons} more offer </Text>
            ) : (
              <Text style={styles.textStyle}>See {remainingCoupons} more offers </Text>
            )
          ) : (
            <Text style={styles.textStyle}>See less offers </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.offersHeadingContainer}>
        <SpecialOffers style={styles.iconStyle} />
        <Text style={[styles.highlightedStyle, { paddingLeft: 9 }]}>Save extra </Text>
        {totalCoupons === 1 ? (
          <Text style={styles.textStyle}>with {totalCoupons} offer</Text>
        ) : (
          <Text style={styles.textStyle}>with {totalCoupons} offers</Text>
        )}
      </View>
      <FlatList
        bounces={false}
        keyExtractor={(_, index) => `${index}`}
        showsHorizontalScrollIndicator={false}
        data={visibleCoupons < totalCoupons ? couponData.slice(0, visibleCoupons) : couponData}
        renderItem={({ item, index }) => {
          return renderIndividualCoupon(item, index);
        }}
      />
      {totalCoupons > 2 && renderViewAllOffersButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    borderWidth: 0.5,
    borderColor: '#02475B',
    marginHorizontal: 15,
  },
  itemContainer: {
    flexDirection: 'column',
    borderBottomWidth: 0.5,
    borderColor: '#02475B',
    paddingLeft: 14,
    paddingTop: 9,
    paddingBottom: 9,
  },
  offersHeadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    height: 42,
    borderBottomWidth: 0.5,
    borderColor: '#02475B',
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconStyle: {
    height: 28,
    width: 28,
    paddingRight: 9,
  },
  textContainer: {
    width: '85%',
  },
  arrowContainer: {
    paddingRight: 16,
  },
  highlightedStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: '#01475B',
    fontWeight: '600',
    lineHeight: 18,
  },
  textStyle: {
    ...theme.fonts.IBMPlexSansRegular(14),
    color: '#01475B',
    fontWeight: '400',
    lineHeight: 18,
  },
  knowMoreSection: {
    paddingTop: 5,
    paddingBottom: 3,
  },
  descriptionTextStyle: {
    ...theme.fonts.IBMPlexSansRegular(13),
    color: '#67919D',
    fontWeight: '400',
    lineHeight: 16,
  },
});
