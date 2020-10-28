import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet, ScrollView } from 'react-native';
import { Header } from '@aph/mobile-patients/src/components/ui/Header';
import { NavigationScreenProps } from 'react-navigation';
import { theme } from '@aph/mobile-patients/src/theme/theme';
import { DoctorCheckoutCard } from '@aph/mobile-patients/src/components/ui/DoctorCheckoutCard';
import { CareMembershipAdded } from '@aph/mobile-patients/src/components/ui/CareMembershipAdded';
import { ListCard } from '@aph/mobile-patients/src/components/ui/ListCard';
import {
  ArrowRight,
  CouponIcon,
  GreenTickIcon,
} from '@aph/mobile-patients/src/components/ui/Icons';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { useAppCommonData } from '@aph/mobile-patients/src/components/AppCommonDataProvider';
import { g, postWebEngageEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';

interface PaymentCheckoutProps extends NavigationScreenProps {}
export const PaymentCheckout: React.FC<PaymentCheckoutProps> = (props) => {
  const [coupon, setCoupon] = useState<string>('');
  const { hdfcUserSubscriptions } = useAppCommonData();

  const renderHeader = () => {
    return (
      <Header
        container={styles.headerContainerStyle}
        leftIcon={'backArrow'}
        title={'CHECKOUT'}
        onPressLeftIcon={() => {
          props.navigation.goBack();
        }}
      />
    );
  };

  const renderDoctorCard = () => {
    return <DoctorCheckoutCard />;
  };

  const renderCareMembershipAddedCard = () => {
    return <CareMembershipAdded />;
  };

  const renderApplyCoupon = () => {
    return (
      <ListCard
        container={styles.couponContainer}
        leftIcon={<CouponIcon />}
        rightIcon={coupon ? <GreenTickIcon /> : <ArrowRight />}
        title={!coupon ? 'Apply Coupon' : 'Coupon Applied'}
        onPress={() => {
          props.navigation.navigate(AppRoutes.ApplyConsultCoupon, {
            coupon: coupon,
            onApplyCoupon: onApplyCoupon,
          });
        }}
      />
    );
  };

  const onApplyCoupon = (value: string) => {
    // return validateCoupon(value);
  };

  //   const validateCoupon = (coupon: string, fireEvent?: boolean) => {
  //     let packageId = '';
  //     if (!!g(hdfcUserSubscriptions, '_id') && !!g(hdfcUserSubscriptions, 'isActive')) {
  //       packageId =
  //         g(hdfcUserSubscriptions, 'group', 'name') + ':' + g(hdfcUserSubscriptions, 'planId');
  //     }
  //     const timeSlot =
  //       tabs[0].title === selectedTab &&
  //       isConsultOnline &&
  //       availableInMin! <= 60 &&
  //       0 < availableInMin!
  //         ? nextAvailableSlot
  //         : selectedTimeSlot;

  //     let ts = new Date(timeSlot).getTime();
  //     console.log(ts);
  //     const data = {
  //       mobile: g(currentPatient, 'mobileNumber'),
  //       billAmount: Number(doctorFees),
  //       coupon: coupon,
  //       // paymentType: 'CASH', //CASH,NetBanking, CARD, COD
  //       pinCode: locationDetails && locationDetails.pincode,
  //       consultations: [
  //         {
  //           hospitalId: g(props.doctor, 'doctorHospital')![0].facility.id,
  //           doctorId: g(props.doctor, 'id'),
  //           specialityId: g(props.doctor, 'specialty', 'id'),
  //           consultationTime: ts, //Unix timestamp“
  //           consultationType: selectedTab === 'Consult Online' ? 1 : 0, //Physical 0, Virtual 1,  All -1
  //           cost: Number(doctorFees),
  //           rescheduling: false,
  //         },
  //       ],
  //       packageId: packageId,
  //       email: g(currentPatient, 'emailAddress'),
  //     };

  //     return new Promise((res, rej) => {
  //       validateConsultCoupon(data)
  //         .then((resp: any) => {
  //           if (resp.data.errorCode == 0) {
  //             if (resp.data.response.valid) {
  //               const revisedAmount =
  //                 Number(doctorFees) - Number(g(resp, 'data', 'response', 'discount')!);
  //               setCoupon(coupon);
  //               setDoctorDiscountedFees(revisedAmount);
  //               res();
  //               if (fireEvent) {
  //                 const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_COUPON_APPLIED] = {
  //                   CouponCode: coupon,
  //                   'Discount Amount': Number(g(resp, 'data', 'response', 'discount')!),
  //                   'Net Amount': Number(revisedAmount),
  //                   'Coupon Applied': true,
  //                 };
  //                 postWebEngageEvent(WebEngageEventName.CONSULT_COUPON_APPLIED, eventAttributes);
  //               }
  //               if (Number(revisedAmount) == 0) {
  //                 fireBaseFCM();
  //               }
  //             } else {
  //               rej(resp.data.response.reason);
  //               if (fireEvent) {
  //                 const eventAttributes: WebEngageEvents[WebEngageEventName.CONSULT_COUPON_APPLIED] = {
  //                   CouponCode: coupon,
  //                   'Coupon Applied': false,
  //                 };
  //                 postWebEngageEvent(WebEngageEventName.CONSULT_COUPON_APPLIED, eventAttributes);
  //               }
  //             }
  //           } else {
  //             rej(resp.data.errorMsg);
  //           }
  //         })
  //         .catch((error) => {
  //           CommonBugFender('validatingConsultCoupon', error);
  //           console.log(error);
  //           rej();
  //           renderErrorPopup(`Something went wrong, plaease try again after sometime`);
  //         });
  //     });
  //   };

  return (
    <View style={theme.viewStyles.container}>
      <SafeAreaView style={theme.viewStyles.container}>
        <ScrollView>
          {renderHeader()}
          {renderDoctorCard()}
          {renderCareMembershipAddedCard()}
          {renderApplyCoupon()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainerStyle: {
    ...theme.viewStyles.cardViewStyle,
    borderRadius: 0,
  },
  couponContainer: {
    ...theme.viewStyles.card(),
    borderRadius: 10,
    margin: 20,
    backgroundColor: 'white',
  },
});
