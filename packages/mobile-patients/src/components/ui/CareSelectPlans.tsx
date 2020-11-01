import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { ScrollView } from 'react-native-gesture-handler';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { CareLogo } from '@aph/mobile-patients/src/components/ui/CareLogo';

interface CareSelectPlansProps {
  onPressKnowMore: () => void;
  style?: StyleProp<ViewStyle>;
  onSelectMembershipPlan: (plan: any) => void;
}

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

export const CareSelectPlans: React.FC<CareSelectPlansProps> = (props) => {
  const [membershipPlans, setMembershipPlans] = useState<any>(subscriptionData);
  const [planSelected, setPlanSelected] = useState<any>();
  const { isCareSubscribed } = useShoppingCart();
  const { onPressKnowMore } = props;

  const onPressMembershipPlans = (index: number) => {
    setPlanSelected(membershipPlans?.[index]);
    props.onSelectMembershipPlan(membershipPlans?.[index]);
  };

  const renderCareSubscribeCard = (value: any, index: number) => (
    <TouchableOpacity onPress={() => onPressMembershipPlans(index)} style={styles.subscriptionCard}>
      <View
        style={[
          styles.optionButton,
          {
            backgroundColor: value.isSelected
              ? theme.colors.SEARCH_UNDERLINE_COLOR
              : theme.colors.WHITE,
          },
        ]}
      />
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Save {value.save} extra</Text>
      </View>
      <View style={styles.rowContainer}>
        <View>
          <Text style={styles.price}>
            {string.common.Rs}
            {value.limitedPriceAmount}
          </Text>
          <Text style={styles.oldPrice}>
            {string.common.Rs}
            {value.amount}
          </Text>
        </View>
        <View style={styles.limitedPriceBanner}>
          <Text style={theme.viewStyles.text('M', 8, '#FFFFFF')}>Limited Price</Text>
        </View>
      </View>
      <Text style={theme.viewStyles.text('M', 12, theme.colors.SHERPA_BLUE)}>
        for {value.duration}
      </Text>
    </TouchableOpacity>
  );

  const renderSubscribeCareContainer = () => (
    <View>
      <View style={styles.careTextContainer}>
        <View style={styles.careRedBox} />
        <Text style={styles.getCareText}>
          Get{' '}
          <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
            {string.common.Rs}5.40 Cashback
          </Text>{' '}
          and{' '}
          <Text style={theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE)}>
            Free delivery
          </Text>{' '}
          on your CURRENT order with CARE
        </Text>
      </View>
      <ScrollView
        style={{ marginTop: 4 }}
        horizontal={true}
        bounces={false}
        showsHorizontalScrollIndicator={false}
      >
        {membershipPlans?.map((value: any, index: number) => renderCareSubscribeCard(value, index))}
      </ScrollView>
      <TouchableOpacity
        style={{ marginTop: 8 }}
        // activeOpacity={1}
        onPress={onPressKnowMore}
      >
        <Text
          style={{
            ...theme.viewStyles.text('SB', 13, theme.colors.APP_YELLOW),
            textAlign: 'right',
          }}
        >
          KNOW MORE
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCarePlanAdded = () => (
    <View>
      <View style={styles.spaceRow}>
        <View style={styles.rowCenter}>
          <CareLogo style={styles.careLogo} textStyle={styles.careLogoTextStyle} />
          <Text style={{ ...theme.viewStyles.text('SB', 13, theme.colors.LIGHT_BLUE) }}>
            CARE Plan added to cart!
          </Text>
        </View>
        <View style={styles.rowCenter}>
          <Text
            style={{
              ...theme.viewStyles.text('SB', 17, theme.colors.SEARCH_UNDERLINE_COLOR),
              marginRight: 7,
            }}
          >
            {string.common.Rs}
            {planSelected?.limitedPriceAmount}
          </Text>
          <Text style={styles.slashedPrice}>
            {string.common.Rs}
            {planSelected?.amount}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={{ marginTop: 7 }}
        onPress={() => {
          setPlanSelected('');
          props.onSelectMembershipPlan('');
        }}
      >
        <Text style={styles.removeTxt}>REMOVE</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.careBannerView, props.style]}>
      {planSelected ? renderCarePlanAdded() : renderSubscribeCareContainer()}
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
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  careTextContainer: {
    flexDirection: 'row',
  },
  careRedBox: {
    width: 23,
    height: 23,
    marginTop: 4,
    backgroundColor: theme.colors.DEEP_RED,
    borderRadius: 2,
    marginRight: 10,
  },
  getCareText: {
    ...theme.viewStyles.text('R', 13, theme.colors.LIGHT_BLUE),
    flexWrap: 'wrap',
  },
  subscriptionCard: {
    ...theme.viewStyles.cardViewStyle,
    padding: 7,
    marginRight: 10,
    marginLeft: 5,
    marginVertical: 10,
    minWidth: 129,
    minHeight: 135,
  },
  optionButton: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderWidth: 2,
  },
  banner: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: theme.colors.APP_YELLOW,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 21,
    justifyContent: 'center',
  },
  bannerText: {
    ...theme.viewStyles.text('M', 10, '#FFFFFF'),
    paddingHorizontal: 8,
  },
  price: {
    ...theme.viewStyles.text('M', 23, theme.colors.SEARCH_UNDERLINE_COLOR),
  },
  oldPrice: {
    ...theme.viewStyles.text('R', 14, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
  },
  limitedPriceBanner: {
    backgroundColor: theme.colors.BUTTON_BG,
    alignSelf: 'baseline',
    paddingHorizontal: 5,
    marginLeft: 8,
    borderRadius: 1,
    height: 16,
    justifyContent: 'center',
  },
  rowContainer: {
    flexDirection: 'row',
    marginTop: 17,
    justifyContent: 'space-between',
    paddingBottom: 4,
  },
  spaceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careLogo: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    marginRight: 9,
  },
  careLogoTextStyle: {
    textTransform: 'lowercase',
    ...theme.fonts.IBMPlexSansMedium(9.5),
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slashedPrice: {
    ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR),
    textDecorationLine: 'line-through',
  },
  removeTxt: {
    ...theme.viewStyles.text('SB', 13, theme.colors.BORDER_BOTTOM_COLOR),
    textAlign: 'right',
  },
});
