import { theme } from '@aph/mobile-patients/src/theme/theme';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import {
  TimelineCartDone,
  TimelineCartProgress,
  TimelineCartUnselected,
  TimelinePatientDone,
  TimelinePatientProgress,
  TimelineReviewProgress,
  TimelineReviewUnselected,
  TimelineScheduleDone,
  TimelineScheduleProgress,
  TimelineScheduleUnselected,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { colors } from '@aph/mobile-patients/src/theme/colors';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { NavigationRoute, NavigationScreenProp, NavigationScreenProps } from 'react-navigation';
import { useDiagnosticsCart } from '@aph/mobile-patients/src/components/DiagnosticsCartProvider';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

const screenWidth = Dimensions.get('window').width;

export enum TIMELINE_HEADING {
  ADD_PATIENT = 'Add Patients',
  CART = 'Cart',
  SCHEDULE = 'Schedule',
  REVIEW = 'Review',
}

export enum SCREEN_NAMES {
  PATIENT = 'AddPatients',
  CART = 'CartPage',
  SCHEDULE = 'AddressSlotSelection',
  REVIEW = 'ReviewOrder',
}

export interface TimelineWizardProps extends NavigationScreenProps {
  currentPage: SCREEN_NAMES;
  upcomingPages: any;
  donePages: any;
  navigation: NavigationScreenProp<NavigationRoute<object>, object>;
  isModify?: boolean;
}

export const TimelineWizard: React.FC<TimelineWizardProps> = (props) => {
  const { currentPage, upcomingPages, donePages, isModify } = props;
  const { isCircleAddedToCart, setIsDiagnosticCircleSubscription } = useDiagnosticsCart();
  const {
    setCircleMembershipCharges,
    setCircleSubPlanId,
    setCirclePlanSelected,
    setCircleSubscriptionId,

    setIsCircleSubscription,
  } = useShoppingCart();

  function imageRules(currentPage: SCREEN_NAMES) {
    switch (currentPage) {
      case SCREEN_NAMES.PATIENT:
        return {
          patientComponent: <TimelinePatientProgress style={styles.iconStyle} />,
          cartComponent: <TimelineCartUnselected style={styles.iconStyle} />,
          scheduleComponent: <TimelineScheduleUnselected style={styles.iconStyle} />,
          reviewComponent: <TimelineReviewUnselected style={styles.iconStyle} />,
          onPressActionOnPatient: false, //set current screen to be false
          onPressActionOnCart: false,
          onPressActionOnSchedule: false,
          onPressActionOnReview: false,
          bold_patient: true,
          bold_cart: false,
          bold_slot: false,
          bold_review: false,
        };
        break;
      case SCREEN_NAMES.CART:
        return {
          patientComponent: <TimelinePatientDone style={styles.iconStyle} />,
          cartComponent: <TimelineCartProgress style={styles.iconStyle} />,
          scheduleComponent: <TimelineScheduleUnselected style={[styles.iconStyle]} />,
          reviewComponent: <TimelineReviewUnselected style={styles.iconStyle} />,
          onPressActionOnPatient: true,
          onPressActionOnCart: false,
          onPressActionOnSchedule: false,
          onPressActionOnReview: false,
          bold_patient: true,
          bold_cart: true,
          bold_slot: false,
          bold_review: false,
        };
        break;
      case SCREEN_NAMES.SCHEDULE:
        return {
          patientComponent: <TimelinePatientDone style={styles.iconStyle} />,
          cartComponent: <TimelineCartDone style={styles.iconStyle} />,
          scheduleComponent: <TimelineScheduleProgress style={styles.iconStyle} />,
          reviewComponent: <TimelineReviewUnselected style={styles.iconStyle} />,
          onPressActionOnPatient: true,
          onPressActionOnCart: true,
          onPressActionOnSchedule: false, //set current screen to be false
          onPressActionOnReview: false,
          bold_patient: true,
          bold_cart: true,
          bold_slot: true,
          bold_review: false,
        };
        break;
      case SCREEN_NAMES.REVIEW:
        return {
          patientComponent: <TimelinePatientDone style={styles.iconStyle} />,
          cartComponent: <TimelineCartDone style={styles.iconStyle} />,
          scheduleComponent: <TimelineScheduleDone style={styles.iconStyle} />,
          reviewComponent: <TimelineReviewProgress style={styles.iconStyle} />,
          onPressActionOnPatient: true,
          onPressActionOnCart: true,
          onPressActionOnSchedule: true,
          onPressActionOnReview: false, //set current screen to be false
          bold_patient: true,
          bold_cart: true,
          bold_slot: true,
          bold_review: true,
        };
        break;
    }
  }

  function _navigateToRespectivePage(pageName: any) {
    // isCircleAddedToCart && setIsCircleAddedToCart?.(false);
    if (isCircleAddedToCart) {
      setCircleMembershipCharges?.(0);
      setCircleSubPlanId?.('');
      setCircleSubscriptionId?.('');
      setIsCircleSubscription?.(false);
      setIsDiagnosticCircleSubscription?.(false);
      setCirclePlanSelected?.(null); //overall
    }
    props.navigation.navigate(pageName);
  }

  const renderPatientPage = () => {
    return (
      <View style={styles.textIconView}>
        <View style={styles.flexRow}>
          <TouchableOpacity
            onPress={() =>
              isModify
                ? {}
                : imageRules(currentPage)?.onPressActionOnPatient
                ? _navigateToRespectivePage(AppRoutes.AddPatients)
                : {}
            }
            style={styles.iconTouch}
          >
            {imageRules(currentPage)?.patientComponent}
          </TouchableOpacity>
          <View
            style={[
              styles.progressLine,
              {
                height: imageRules(currentPage)?.onPressActionOnPatient ? 3 : 1,
              },
            ]}
          />
        </View>
        <View style={styles.textView}>
          <Text
            style={[
              styles.headingStyle,
              {
                color: imageRules(currentPage)?.bold_patient
                  ? colors.APP_GREEN
                  : colors.SHERPA_BLUE,
              },
            ]}
          >
            {TIMELINE_HEADING.ADD_PATIENT}
          </Text>
        </View>
      </View>
    );
  };

  const renderCartPage = () => {
    return (
      <View style={styles.textIconView}>
        <View style={styles.flexRow}>
          <TouchableOpacity
            onPress={() =>
              imageRules(currentPage)?.onPressActionOnCart
                ? _navigateToRespectivePage(AppRoutes.CartPage)
                : {}
            }
            style={styles.iconTouch}
          >
            {imageRules(currentPage)?.cartComponent}
          </TouchableOpacity>
          <View
            style={[
              styles.progressLine,
              {
                height: imageRules(currentPage)?.onPressActionOnCart ? 3 : 1,
                width: isModify ? screenWidth / 2 : screenWidth / 3.2,
              },
            ]}
          />
        </View>
        <View style={[styles.textView, { marginLeft: -6 }]}>
          <Text
            style={[
              styles.headingStyle,
              {
                color: imageRules(currentPage)?.bold_cart ? colors.APP_GREEN : colors.SHERPA_BLUE,
                left: -7,
              },
            ]}
          >
            {TIMELINE_HEADING.CART}
          </Text>
        </View>
      </View>
    );
  };

  const renderSlotPage = () => {
    return (
      <View style={styles.textIconView}>
        <View style={styles.flexRow}>
          <TouchableOpacity
            onPress={() =>
              isModify
                ? {}
                : imageRules(currentPage)?.onPressActionOnSchedule
                ? _navigateToRespectivePage(AppRoutes.AddressSlotSelection)
                : {}
            }
            style={styles.iconTouch}
          >
            {imageRules(currentPage)?.scheduleComponent}
          </TouchableOpacity>
          <View
            style={[
              styles.progressLine,
              {
                height: imageRules(currentPage)?.onPressActionOnSchedule ? 3 : 1,

                left: 9,
              },
            ]}
          />
        </View>
        <View style={styles.textView}>
          <Text
            style={[
              styles.headingStyle,
              {
                color: imageRules(currentPage)?.bold_slot ? colors.APP_GREEN : colors.SHERPA_BLUE,
                left: -3,
              },
            ]}
          >
            {TIMELINE_HEADING.SCHEDULE}
          </Text>
        </View>
      </View>
    );
  };

  const renderReviewPage = () => {
    return (
      <View style={styles.textIconView}>
        <View style={styles.flexRow}>
          <TouchableOpacity
            onPress={() =>
              imageRules(currentPage)?.onPressActionOnReview
                ? props.navigation.navigate(AppRoutes.ReviewOrder)
                : {}
            }
            style={[styles.iconTouch, { width: 50, marginRight: 0 }]}
          >
            {imageRules(currentPage)?.reviewComponent}
          </TouchableOpacity>
        </View>
        <View style={styles.textView}>
          <Text
            style={[
              styles.headingStyle,
              {
                color: imageRules(currentPage)?.bold_review ? colors.APP_GREEN : colors.SHERPA_BLUE,
              },
            ]}
          >
            {TIMELINE_HEADING.REVIEW}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[isModify ? styles.centerTimelineView : styles.timelineView]}>
        {isModify ? null : renderPatientPage()}
        {renderCartPage()}
        {isModify ? null : renderSlotPage()}
        {renderReviewPage()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: colors.WHITE,
    elevation: 4,
    shadowColor: colors.SHADOW_GRAY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  iconStyle: { height: 27, width: 27, resizeMode: 'contain' },
  headingStyle: {
    ...theme.fonts.IBMPlexSansMedium(12),
    lineHeight: 14,
    textAlign: 'center',
  },
  textIconView: { paddingTop: 12, paddingBottom: 8 },
  textView: {
    marginTop: 4,
  },
  iconTouch: {
    height: '100%',
    width: 45,
    marginRight: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  progressLine: {
    backgroundColor: colors.APP_GREEN,
    left: 16,
    width: screenWidth / 3.2, //increase denominator to adjust
    position: 'absolute',
  },
  timelineView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 16,
    marginRight: 16,
  },
  centerTimelineView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: screenWidth / 1.6,
    alignSelf: 'center',
  },
});
