import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ScrollView } from 'react-native-gesture-handler';
import { CareCashbackBanner } from '@aph/mobile-patients/src/components/ui/CareCashbackBanner';
import { CheckBoxFilled, CheckUnselectedIcon } from '@aph/mobile-patients/src/components/ui/Icons';

interface CareSelectPlansProps {
  onPressKnowMore: () => void;
}

export const CareSelectPlans: React.FC<CareSelectPlansProps> = (props) => {
  const { isCircleSubscription, coupon, setCoupon } = useShoppingCart();
  const { onPressKnowMore } = props;
  const subscriptionData = [
    {
      amount: '299',
      save: '10%',
      isLimitedPrice: true,
      limitedPriceAmount: '89',
      duration: '1 months',
      isSelected: false,
    },
    {
      amount: '999',
      save: '20%',
      isLimitedPrice: true,
      limitedPriceAmount: '399',
      duration: '6 months',
      isSelected: false,
    },
    {
      amount: '1999',
      save: '30%',
      isLimitedPrice: true,
      limitedPriceAmount: '699',
      duration: '12 months',
      isSelected: false,
    },
  ];

  const renderCareSubscribeCard = (value: any) =>
    <TouchableOpacity onPress={() => {}} style={styles.subscriptionCard}>
      <View style={[
        styles.optionButton,
        {backgroundColor: value.isSelected ? '#00B38E' : theme.colors.WHITE}
      ]} />
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Save {value.save} extra</Text>
      </View>
      <View style={{
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
        paddingBottom: 10,
      }}>
        <View>
          <Text style={styles.price}>₹{value.limitedPriceAmount}</Text>
          <Text style={styles.oldPrice}>₹{value.amount}</Text>
        </View>
        <View style={styles.limitedPriceBanner}>
          <Text style={theme.viewStyles.text('M', 13, '#FFFFFF', 1, 13)}>
            Limited Price
          </Text>
        </View>
      </View>
      <Text style={theme.viewStyles.text('M', 14, '#01475B', 1, 25)}>for {value.duration}</Text>
    </TouchableOpacity>

  const renderSubscribeCareContainer = () =>
    <View>
      <View style={styles.careTextContainer}>
        <View style={styles.careRedBox} />
        <Text style={styles.getCareText}>
          Get{' '}
          <Text style={theme.viewStyles.text('B', 13, '#02475B', 1, 20)}>₹5.40 Cashback</Text>{' '}
          and{' '}
          <Text style={theme.viewStyles.text('B', 13, '#02475B', 1, 20)}>Free delivery</Text>{' '}
          on your CURRENT order with CARE
        </Text>
      </View>
      <ScrollView 
        horizontal={true}
        bounces={false}
      >
        {subscriptionData.map(value => renderCareSubscribeCard(value))}
      </ScrollView>
      <TouchableOpacity 
        style={{marginTop: 20}}
        // activeOpacity={1} 
        onPress={onPressKnowMore}
      >
        <Text style={{
          ...theme.viewStyles.text('B', 15, '#FC9916', 1, 25),
          textAlign: 'right',
        }}>
          KNOW MORE
        </Text>
      </TouchableOpacity>
    </View>

  const renderCarePlanAdded = () =>
    <TouchableOpacity onPress={() => {
      if (coupon) setCoupon!(null);
    }} activeOpacity={1}>
      <View style={{
        flexDirection: 'row',
      }}>
        {
          coupon 
          ?
          <>
            <CheckUnselectedIcon style={{
              resizeMode: 'contain',
              height: 25,
              width: 25,
              marginRight: 10,
              marginTop: 8,
            }} />
            {renderApplyCareBanner()}
          </>
          : 
          <>
            <CheckBoxFilled style={{
              resizeMode: 'contain',
              height: 25,
              width: 25,
              marginRight: 10,
              marginTop: 8,
            }} />
            {renderCareCashback()}
          </>
        }
      </View>
    </TouchableOpacity>

  const renderApplyCareBanner = () => {
    return (
      <View>
        <View style={{
          flexDirection: 'row',
        }}>
          <Text style={{
            ...theme.viewStyles.text('M', 14, '#02475B', 1, 17),
            paddingTop: 12,
          }}>Apply</Text>
          <CareCashbackBanner
            bannerText={`benefits instead`}
            textStyle={{
              ...theme.viewStyles.text('M', 14, '#02475B', 1, 17),
              paddingTop: 12,
              left: -5,
            }}
            logoStyle={{
              resizeMode: 'contain',
              width: 50,
              height: 40,
            }}
          />
        </View>
        <Text style={theme.viewStyles.text('R', 13, '#02475B', 1, 20)}>
          Use your Circle membership instead and get{' '}
          <Text style={theme.viewStyles.text('B', 13, '#02475B', 1, 20)}>₹54 Cashback and Free delivery{' '}</Text>
          on this order
        </Text>
      </View>
    )
  };

  const renderCareCashback = () => {
    return (
      <CareCashbackBanner
        bannerText={`benefits APPLIED!`}
        textStyle={{
          ...theme.viewStyles.text('M', 14, '#02475B', 1, 17),
          paddingTop: 12,
          left: -5,
        }}
        logoStyle={{
          resizeMode: 'contain',
          width: 50,
          height: 40,
        }}
      />
    );
  };

  return (
    <View style={styles.careBannerView}>
      {
        isCircleSubscription ?
        renderCarePlanAdded() :
        renderSubscribeCareContainer()
      }
    </View>
  );
};

const styles = StyleSheet.create({
  careBannerView: {
    ...theme.viewStyles.cardViewStyle,
    marginTop: 10,
    marginHorizontal: 13,
    borderRadius: 5,
    marginBottom: 0,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderColor: '#00B38E',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  careTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careRedBox: {
    width: 25,
    height: 25,
    marginTop: 4,
    backgroundColor: '#F0533B',
    borderRadius: 5,
    marginRight: 15,
  },
  getCareText: {
    ...theme.viewStyles.text('R', 13, '#02475B', 1, 20),
    flexWrap: 'wrap',
  },
  subscriptionCard: {
    ...theme.viewStyles.cardViewStyle,
    padding: 10,
    marginRight: 10,
    marginLeft: 5,
    marginVertical: 10,
    minWidth: 160,
    minHeight: 150,
  },
  optionButton: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderColor: '#00B38E',
    borderWidth: 3,
  },
  banner: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FC9916',
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  bannerText: {
    ...theme.viewStyles.text('M', 12, '#FFFFFF', 1, 15),
    padding: 5,
    paddingHorizontal: 8,
  },
  price: {
    ...theme.viewStyles.text('M', 23, '#00B38E', 1, 25),
  },
  oldPrice: {
    ...theme.viewStyles.text('R', 14, '#979797', 1, 20),
    textDecorationLine: 'line-through',
  },
  limitedPriceBanner: {
    backgroundColor: '#FCB716',
    alignSelf: 'baseline',
    padding: 4,
    marginLeft: 8,
    borderRadius: 2,
  },
});