import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import string from '@aph/mobile-patients/src/strings/strings.json';
import { Down, Up, CircleLogo, ExclamationGreen } from '@aph/mobile-patients/src/components/ui/Icons';
import { getDoctorDetailsById_getDoctorDetailsById } from '@aph/mobile-patients/src/graphql/types/getDoctorDetailsById';
import {
  calculateCircleDoctorPricing,
  convertNumberToDecimal,
  isPhysicalConsultation,
} from '@aph/mobile-patients/src/utils/commonUtils';
import {Tooltip} from 'react-native-elements';

interface ConsultDiscountProps {
  onPressCard: TouchableOpacityProps['onPress'];
  doctor: getDoctorDetailsById_getDoctorDetailsById | null;
  selectedTab: string;
  coupon: string;
  couponDiscountFees: number;
  circleSubscriptionId?: string;
  planSelected?: any;
  style?: StyleProp<ViewStyle>;
}

export const ConsultDiscountCard: React.FC<ConsultDiscountProps> = (props) => {
  const {
    onPressCard,
    doctor,
    selectedTab,
    coupon,
    couponDiscountFees,
    circleSubscriptionId,
    planSelected,
  } = props;
  const isOnlineConsult =
    selectedTab === string.consultModeTab.VIDEO_CONSULT ||
    selectedTab === string.consultModeTab.CONSULT_ONLINE;
  const isPhysicalConsult = isPhysicalConsultation(selectedTab);
  const circleDoctorDetails = calculateCircleDoctorPricing(
    doctor,
    isOnlineConsult,
    isPhysicalConsult
  );
  const {
    physicalConsultDiscountedPrice,
    onlineConsultDiscountedPrice,
    isCircleDoctorOnSelectedConsultMode,
    cashbackAmount,
    cashbackEnabled,
  } = circleDoctorDetails;

  const totalSavings =
    isCircleDoctorOnSelectedConsultMode && (circleSubscriptionId || planSelected)
      ? isOnlineConsult 
        ? cashbackEnabled
        ? cashbackAmount + couponDiscountFees
        : onlineConsultDiscountedPrice + couponDiscountFees
        : physicalConsultDiscountedPrice + couponDiscountFees
      : couponDiscountFees;
  const [showPriceBreakup, setShowPriceBreakup] = useState<boolean>(false);

  if (totalSavings > 0) {
    return (
      <View style={[styles.container, props.style]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.rowContainer}
          onPress={() => {
            setShowPriceBreakup(!showPriceBreakup);
            onPressCard();
          }}
        >
          <Text style={styles.regularText}>
            You{' '}
            <Text style={{ ...styles.regularText, color: theme.colors.SEARCH_UNDERLINE_COLOR }}>
              saved {string.common.Rs}
              {convertNumberToDecimal(totalSavings)}
            </Text>{' '}
            on your consult.
          </Text>
          {showPriceBreakup ? <Up /> : <Down />}
        </TouchableOpacity>
        {showPriceBreakup ? (
          <View>
            <View style={styles.seperatorLine} />
            {coupon ? (
              <View style={[styles.rowContainer, { marginTop: 5 }]}>
                <Text style={styles.couponTextStyle}>
                  {string.common.couponApplied} ({`${coupon}`})
                </Text>
                <Text style={[styles.membershipDiscountStyle, { color: theme.colors.LIGHT_BLUE }]}>
                  {string.common.Rs}
                  {convertNumberToDecimal(couponDiscountFees)}
                </Text>
              </View>
            ) : null}
            {isCircleDoctorOnSelectedConsultMode && 
            (!!circleSubscriptionId || planSelected) ? !cashbackEnabled ? (
              <View style={[styles.rowContainer, { marginTop: 5 }]}>
                <View style={styles.row}>
                  <CircleLogo style={styles.careLogo} />
                  <Text style={styles.membershipDiscountStyle}>
                    {string.common.membershipDiscount}
                  </Text>
                </View>
                <Text style={styles.membershipDiscountStyle}>
                  {string.common.Rs}
                  {convertNumberToDecimal(
                    isOnlineConsult ? onlineConsultDiscountedPrice : physicalConsultDiscountedPrice
                  )}
                </Text>
              </View>
            ) : (
              <View style={[styles.rowContainer, { marginTop: 5 }]}>
                <View style={styles.row}>
                  <Text style={styles.circleCashbackStyle}>
                    Circle
                    <Text style={styles.couponTextStyle}>
                      {string.common.circleCashback}
                      {coupon && '(HC)'}
                    </Text>
                  </Text>
                  {!!coupon &&
                    <Tooltip
                      containerStyle={styles.tooltipView}
                      height={80}
                      width={264}
                      skipAndroidStatusBar={true}
                      pointerColor={theme.colors.WHITE}
                      overlayColor={theme.colors.CLEAR}
                      popover={
                        <View>
                          <Text style={styles.tooltipTitle}>{string.common.whyCashbackChanged}</Text>
                          <Text style={styles.tootipDesc}>{string.common.hcCreditInfo}</Text>
                        </View>
                    }>
                      <ExclamationGreen style={styles.infoIcon} />
                    </Tooltip>}
                </View>
                <Text style={styles.circleCashbackStyle}>
                  {`${cashbackAmount} HC`}
                </Text>
              </View>
            ) : null}
            {cashbackEnabled &&
              <Text style={styles.cashbackInfo}>
                {string.common.cashbackInfo}
                <Text style={styles.cashbackInfoBold}>1 HC= ₹ 1)</Text>
              </Text>}
            <View style={styles.seperatorLine} />
            <Text style={styles.totalPayStyle}>
              {string.common.Rs}
              {convertNumberToDecimal(totalSavings)}
            </Text>
          </View>
        ) : null}
      </View>
    );
  }
  return <View />;
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: theme.colors.SEARCH_UNDERLINE_COLOR,
    borderStyle: 'dashed',
    padding: 10,
    backgroundColor: 'white',
    ...theme.viewStyles.cardViewStyle,
    zIndex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regularText: {
    ...theme.viewStyles.text('M', 13, theme.colors.LIGHT_BLUE),
  },
  seperatorLine: {
    marginTop: 10,
    height: 0.5,
    backgroundColor: theme.colors.LIGHT_BLUE,
    opacity: 0.2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  careLogo: {
    width: 25,
    height: 15,
    marginRight: 2,
  },
  careLogoText: {
    ...theme.viewStyles.text('M', 7, 'white'),
  },
  membershipDiscountStyle: {
    ...theme.viewStyles.text('R', 11, theme.colors.SEARCH_UNDERLINE_COLOR),
    fontWeight: '400',
  },
  totalPayStyle: {
    ...theme.viewStyles.text('M', 11, theme.colors.LIGHT_BLUE),
    marginLeft: 'auto',
    marginTop: 10,
  },
  couponTextStyle: {
    ...theme.viewStyles.text('R', 11, theme.colors.LIGHT_BLUE),
    fontWeight: '400',
  },
  circleCashbackStyle: {
    ...theme.viewStyles.text('R', 11, theme.colors.APP_YELLOW),
    fontWeight: '400',
  },
  cashbackInfo: {
    ...theme.viewStyles.text('R', 10, theme.colors.BORDER_BOTTOM_COLOR),
    fontWeight: '400',
    paddingTop: 4,
  },
  cashbackInfoBold: {
    ...theme.viewStyles.text('M', 10, theme.colors.BORDER_BOTTOM_COLOR),
    fontWeight: '700',
  },
  infoIcon: {
    height: 12, 
    width: 12, 
    marginStart: 8
  },
  tooltipTitle: {
    ...theme.viewStyles.text('M', 13, theme.colors.APP_YELLOW)
  },
  tootipDesc: {
    ...theme.viewStyles.text('R', 10, theme.colors.LIGHT_BLUE, undefined, 12),
    paddingTop: 4,
  },
  tipHcInfoText: {
    ...theme.viewStyles.text('M', 12, theme.colors.LIGHT_BLUE, undefined, 14),
    paddingTop: 4,
  },
  hcBoldText: {
    fontWeight: '500',
  },
  tooltipView: {
    backgroundColor: theme.colors.WHITE,
    shadowColor: theme.colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 8
  },
});
