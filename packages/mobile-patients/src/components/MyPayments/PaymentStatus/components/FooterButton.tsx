/**
 * @author vishnu-apollo247
 * @email vishnu.r@apollo247.org
 */

import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppRoutes } from '@aph/mobile-patients/src/components/NavigatorContainer';
import { Button } from '@aph/mobile-patients/src/components/ui/Button';
import PaymentConstants from '@aph/mobile-patients/src/components/MyPayments/constants';
import { useAllCurrentPatients } from '@aph/mobile-patients/src/hooks/authHooks';
import { getUserType, postCleverTapEvent } from '@aph/mobile-patients/src/helpers/helperFunctions';
import {
  CleverTapEventName,
  CleverTapEvents,
  HomeScreenAttributes,
} from '@aph/mobile-patients/src/helpers/CleverTapEvents';
import moment from 'moment';
import { useShoppingCart } from '@aph/mobile-patients/src/components/ShoppingCartProvider';

interface FooterButtonProps {
  item: any;
  paymentFor: string;
  navigationProps: any;
}
const FooterButton: FC<FooterButtonProps> = (props) => {
  const { SUCCESS, FAILED, REFUND } = PaymentConstants;
  const { currentPatient, allCurrentPatients } = useAllCurrentPatients();
  const { circleSubscriptionId, circleSubPlanId } = useShoppingCart();
  const statusItemValues = () => {
    const { paymentFor, item } = props;
    let status = 'PENDING';
    let orderID = 0;
    if (paymentFor === 'consult') {
      const { appointmentPayments, appointmentRefunds, PaymentOrders } = item;
      const { refund } = PaymentOrders;
      const refundInfo = refund?.length ? refund : appointmentRefunds;
      const paymentInfo = PaymentOrders?.paymentStatus ? PaymentOrders : appointmentPayments[0];
      if (!paymentInfo) {
        status = 'PENDING';
      } else if (refundInfo.length) {
        status = REFUND;
      } else {
        status = paymentInfo?.paymentStatus;
      }
      return {
        status: status,
      };
    } else {
      const { medicineOrderPayments, orderAutoId, currentStatus, PaymentOrdersPharma } = item;
      const { refund } = PaymentOrdersPharma;
      const refundInfo = refund?.length ? refund : medicineOrderPayments[0]?.medicineOrderRefunds;
      const paymentInfo = PaymentOrdersPharma?.paymentStatus
        ? PaymentOrdersPharma
        : medicineOrderPayments[0];
      orderID = orderAutoId;
      if (!paymentInfo) {
        status = 'PENDING';
      } else if (currentStatus === 'CANCELLED' && refundInfo?.length) {
        status = REFUND;
      } else {
        status = paymentInfo.paymentStatus;
      }
      return {
        status: status,
        orderID: orderID,
      };
    }
  };
  const getTitle = () => {
    const { paymentFor } = props;
    const { status } = statusItemValues();
    let buttonTitle = 'TRY AGAIN';
    if (paymentFor === 'consult') {
      if (status === FAILED) {
        buttonTitle = 'TRY AGAIN';
        return { buttonTitle: buttonTitle };
      } else if (status === SUCCESS) {
        buttonTitle = 'GO TO CONSULT ROOM';
        return { buttonTitle: buttonTitle };
      } else {
        buttonTitle = 'GO TO HOME';
        return { buttonTitle: buttonTitle };
      }
    } else {
      if (status === FAILED) {
        buttonTitle = 'TRY AGAIN';
        return { buttonTitle: buttonTitle };
      } else if (status === SUCCESS) {
        buttonTitle = 'TRACK ORDER';
        return { buttonTitle: buttonTitle };
      } else {
        buttonTitle = 'GO TO HOME';
        return { buttonTitle: buttonTitle };
      }
    }
  };

  const postGoToConsultRoomEvent = (item: any) => {
    const commonAttributes = {
      'Patient name': `${currentPatient?.firstName} ${currentPatient?.lastName}` || '',
      'Patient UHID': currentPatient?.uhid || '',
      'Patient gender': currentPatient?.gender || '',
      'Patient age': Math.round(moment().diff(currentPatient?.dateOfBirth || 0, 'years', true)),
    };
    const eventAttributes: CleverTapEvents[CleverTapEventName.CONSULT_GO_TO_CONSULT_ROOM_CLICKED] = {
      ...commonAttributes,
      'Doctor name': item?.doctor?.name || '',
      'Doctor ID': item?.id || '',
      Source: 'My Account',
      'Appointment datetime': moment(item?.appointmentDateTime).toDate(),
      'Display ID': item?.displayId,
      'Consult mode': item?.appointmentType || '',
    };

    const activeAppointmentsAttributes: HomeScreenAttributes = {
      ...commonAttributes,
      'Mobile Number': currentPatient?.mobileNumber,
      'Customer ID': currentPatient?.id,
      'Nav src': 'My Account',
      'Circle Member': !!circleSubscriptionId,
      'Circle Plan type': circleSubPlanId || '',
      'Page Name': 'Payment Status',
      User_Type: getUserType(allCurrentPatients),
      Relation: currentPatient?.relation || '',
    };
    postCleverTapEvent(CleverTapEventName.CONSULT_ACTIVE_APPOINTMENTS, activeAppointmentsAttributes);
    postCleverTapEvent(CleverTapEventName.CONSULT_GO_TO_CONSULT_ROOM_CLICKED, eventAttributes);
  };

  const navigateTo = () => {
    const { status, orderID } = statusItemValues();
    const { paymentFor, item } = props;
    if (paymentFor === 'consult') {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.DoctorSearch, {});
      } else if (status === SUCCESS) {
        postGoToConsultRoomEvent(item);
        props.navigationProps.navigate(AppRoutes.Consult, {});
      } else {
        props.navigationProps.navigate(AppRoutes.ConsultRoom, {});
      }
    } else {
      if (status === FAILED) {
        props.navigationProps.navigate(AppRoutes.MedicineCart, {});
      } else if (status === SUCCESS) {
        props.navigationProps.navigate(AppRoutes.OrderDetailsScene, {
          orderAutoId: orderID,
        });
      } else {
        props.navigationProps.navigate(AppRoutes.ConsultRoom, {});
      }
    }
  };
  const { buttonTitle } = getTitle();
  return (
    <View style={styles.mainContainer}>
      <Button
        style={styles.buttonStyles}
        title={buttonTitle}
        onPress={() => {
          navigateTo();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    display: 'flex',
    alignItems: 'center',
    marginVertical: 15,
  },
  buttonStyles: {
    width: '80%',
  },
});

export default FooterButton;
